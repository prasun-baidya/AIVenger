"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user as userTable, generation as generationTable } from "@/lib/schema";
import { upload } from "@/lib/storage";
import type { GenerateAvatarResult } from "@/types/generation";

export async function generateAvatar(
  formData: FormData
): Promise<GenerateAvatarResult> {
  // 1. Authentication Check
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
  }

  const userId = session.user.id;

  try {
    // 2. Check User Credits
    const userRecord = await db.query.user.findFirst({
      where: eq(userTable.id, userId),
      columns: { credits: true },
    });

    if (!userRecord || userRecord.credits < 10) {
      return {
        success: false,
        error: "Insufficient credits. Upgrade your plan to continue.",
        code: "INSUFFICIENT_CREDITS",
      };
    }

    // 3. Extract Image from FormData
    const file = formData.get("image") as File;
    if (!file) {
      return {
        success: false,
        error: "No image provided",
        code: "UPLOAD_FAILED",
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 4. Upload Original Image to Blob Storage
    const timestamp = Date.now();
    const originalFilename = `original_${userId}_${timestamp}_${file.name}`;
    const { url: originalImageUrl } = await upload(
      buffer,
      originalFilename,
      "avatars"
    );

    // 5. Create Pending Generation Record
    const generationId = `gen_${timestamp}_${crypto.randomUUID()}`;
    await db.insert(generationTable).values({
      id: generationId,
      userId,
      originalImageUrl,
      generatedImageUrl: null,
      status: "pending",
    });

    // 6. Deduct Credits IMMEDIATELY (before AI call to prevent abuse)
    await db
      .update(userTable)
      .set({ credits: userRecord.credits - 10 })
      .where(eq(userTable.id, userId));

    // 7. Call AI Generation with base64 image (works with local and remote URLs)
    let generatedImageUrl: string;
    try {
      generatedImageUrl = await callOpenRouterImageGeneration(buffer, file.type);
    } catch (aiError) {
      // Mark as failed but DON'T refund credits
      await db
        .update(generationTable)
        .set({
          status: "failed",
          errorMessage:
            aiError instanceof Error ? aiError.message : "AI generation failed",
        })
        .where(eq(generationTable.id, generationId));

      return {
        success: false,
        error: "AI generation failed. Please try again later.",
        code: "AI_GENERATION_FAILED",
      };
    }

    // 8. Download and Re-Upload Generated Image to Blob Storage
    const generatedResponse = await fetch(generatedImageUrl);
    const generatedBuffer = Buffer.from(await generatedResponse.arrayBuffer());
    const generatedFilename = `generated_${userId}_${timestamp}.png`;
    const { url: finalGeneratedUrl } = await upload(
      generatedBuffer,
      generatedFilename,
      "avatars"
    );

    // 9. Update Generation to Completed
    await db
      .update(generationTable)
      .set({
        generatedImageUrl: finalGeneratedUrl,
        status: "completed",
      })
      .where(eq(generationTable.id, generationId));

    // 10. Fetch Final Record and Return
    const finalGeneration = await db.query.generation.findFirst({
      where: eq(generationTable.id, generationId),
    });

    // Revalidate pages to show updated data
    revalidatePath("/dashboard");
    revalidatePath("/gallery");

    return {
      success: true,
      generation: finalGeneration!,
      remainingCredits: userRecord.credits - 10,
    };
  } catch (error) {
    console.error("Unexpected generation error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      code: "DATABASE_ERROR",
    };
  }
}

/**
 * Call OpenRouter API with Gemini 2.5 Flash Image model
 * @param imageBuffer - Buffer containing the original image data
 * @param mimeType - MIME type of the image (e.g., "image/jpeg")
 * @returns Public URL of the generated image
 */
async function callOpenRouterImageGeneration(
  imageBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const MODEL = "google/gemini-2.5-flash-image";

  // Convert buffer to base64 data URI
  const base64Image = imageBuffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64Image}`;

  // Detailed narrative prompt (not keyword list)
  const prompt = `Transform this person into an epic superhero character. Preserve their facial features and identity while adding:
- A heroic costume with bold colors and iconic design elements
- Dramatic cinematic lighting with strong contrast and depth
- A powerful, confident pose that conveys strength and heroism
- Dynamic background with energy effects or cityscape
- Professional comic book or movie poster aesthetic

Maintain the original aspect ratio. Create a stunning, photorealistic superhero transformation that stays true to the person's appearance.`;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "AIVenger",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: dataUri },
              },
            ],
          },
        ],
        modalities: ["image", "text"], // CRITICAL: Enables image generation (Gemini outputs both text and images)
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
    const errorMessage = errorData.error?.message || errorData.message || "Unknown error";

    console.error("OpenRouter API Error:", {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
    });

    // Special handling for credit issues
    if (response.status === 402) {
      throw new Error(`Insufficient OpenRouter credits. Please add credits at https://openrouter.ai/settings/credits`);
    }

    throw new Error(`OpenRouter API failed (${response.status}): ${errorMessage}`);
  }

  const data = await response.json();

  // Extract image URL from response - images are in the "images" field, not "content"
  const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

  if (!imageUrl) {
    console.error("Full OpenRouter response:", JSON.stringify(data, null, 2));
    throw new Error("No image URL in OpenRouter response");
  }

  return imageUrl;
}
