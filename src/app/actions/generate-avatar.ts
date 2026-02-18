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

// Superhero theme variations for randomization
const SUPERHERO_THEMES = [
  "tech-powered cyborg hero with neon circuits and holographic effects",
  "mystic sorcerer with glowing runes and magical energy",
  "cosmic warrior with galaxy patterns and stellar powers",
  "elemental master controlling fire, ice, lightning, or earth",
  "shadow assassin with dark, sleek tactical gear",
  "speedster with lightning trails and motion blur effects",
  "tank hero with heavy armor and incredible strength",
  "nature guardian with organic, plant-based powers",
  "time manipulator with clockwork and temporal distortion effects",
  "psychic hero with mind-bending aura and telekinetic energy",
];

const COSTUME_STYLES = [
  "sleek and modern with metallic accents",
  "classic comic book style with bold colors and cape",
  "armored and tactical with high-tech details",
  "flowing and ethereal with energy trails",
  "cyberpunk-inspired with glowing elements",
  "medieval fantasy with mystical runes",
  "futuristic nano-suit with reactive surfaces",
  "organic bio-armor with natural textures",
];

const COLOR_SCHEMES = [
  "electric blue and silver",
  "crimson red and gold",
  "emerald green and black",
  "purple and cosmic violet",
  "orange and flame accents",
  "ice blue and white",
  "shadow black and deep purple",
  "golden yellow and bronze",
  "teal and aquamarine",
  "magenta and electric pink",
];

const POSES = [
  "heroic landing pose with one knee down",
  "powerful standing pose with arms crossed",
  "dynamic action pose mid-leap",
  "confident battle-ready stance",
  "energy-charging pose with glowing hands raised",
  "dramatic cape-billowing pose",
  "intimidating power pose from low angle",
  "graceful aerial pose",
];

const BACKGROUNDS = [
  "futuristic cityscape at night with neon lights",
  "destroyed battlefield with debris and smoke",
  "cosmic space with nebulas and stars",
  "stormy sky with dramatic lightning",
  "high-tech laboratory with glowing screens",
  "ancient temple ruins with mystical atmosphere",
  "rooftop overlooking a sprawling city at sunset",
  "portal or dimensional rift with energy swirls",
  "arena with epic stadium lighting",
  "apocalyptic wasteland with dramatic clouds",
];

const LIGHTING_STYLES = [
  "dramatic rim lighting with strong backlight",
  "cinematic side lighting with deep shadows",
  "heroic uplighting from below",
  "volumetric god rays from above",
  "neon color grading with cyberpunk vibes",
  "golden hour warm tones",
  "cool blue moonlight atmosphere",
  "high-contrast comic book lighting",
];

const HUMOROUS_ELEMENTS = [
  "exaggerated superhero muscles that look comically oversized",
  "a tiny sidekick animal with superpowers (flying cat, laser-eyed hamster, etc.)",
  "dramatic wind blowing their hair/cape but everything else is still",
  "overly dramatic hero pose that's slightly awkward or silly",
  "wearing mismatched superhero accessories (boots too big, cape tangled, mask slightly crooked)",
  "accidentally-on-purpose showing off (flexing, winking, finger guns)",
  "a 'BOOM!' or 'POW!' comic book effect appearing behind them",
  "carrying an absurdly mundane object as their 'weapon' (coffee mug, TV remote, rubber chicken)",
  "their costume has a funny logo or symbol (like a pizza slice, WiFi symbol, or emoji)",
  "doing a superhero landing but creating a tiny crack instead of big destruction",
];

// AI effects applied directly to the face/skin
const FACE_AI_EFFECTS = [
  "glowing electric circuit lines etched along the cheekbones and temples, pulsing with energy",
  "eyes glowing with supernatural power — iris luminous, matching the hero's element (fire, lightning, ice, etc.)",
  "holographic scan-line texture over the face, like a real-time AI rendering artifact",
  "metallic cybernetic patches fused into the skin at the jaw and brow, chrome and organic blended",
  "bioluminescent energy veins branching across the cheeks and forehead like glowing cracks of power",
  "subtle digital fragmentation at the edges of the face — pixels dissolving into energy",
  "constellation/star map projected onto the skin, following the natural bone structure of the face",
  "neon tattoo-like power markings flowing from the eyes down the cheeks, pulsing with light",
  "fractured crystal or ice forming over one side of the face, catching light dramatically",
  "neural network nodes and connection lines mapped over the face, glowing blue or gold",
  "smoke or plasma energy wisps rising from the eyes and dissipating into the air",
  "augmented reality targeting HUD projected onto the face with fine reticle lines and readouts",
];

/**
 * Generate a randomized superhero transformation prompt
 */
function generateRandomSuperheroPrompt(): string {
  const theme = SUPERHERO_THEMES[Math.floor(Math.random() * SUPERHERO_THEMES.length)];
  const costume = COSTUME_STYLES[Math.floor(Math.random() * COSTUME_STYLES.length)];
  const colors = COLOR_SCHEMES[Math.floor(Math.random() * COLOR_SCHEMES.length)];
  const pose = POSES[Math.floor(Math.random() * POSES.length)];
  const background = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
  const lighting = LIGHTING_STYLES[Math.floor(Math.random() * LIGHTING_STYLES.length)];
  const humor = HUMOROUS_ELEMENTS[Math.floor(Math.random() * HUMOROUS_ELEMENTS.length)];
  const faceEffect = FACE_AI_EFFECTS[Math.floor(Math.random() * FACE_AI_EFFECTS.length)];

  return `SUPERHERO FACE TRANSFORMATION — Based on the person in this photo.

== PRIORITY #1: FACE RESEMBLANCE (This is the most important requirement) ==
The person's face from the uploaded photo MUST be IMMEDIATELY and UNMISTAKABLY recognizable in the output. A friend seeing the result must say "that's them!".

Preserve with absolute accuracy:
- Eye shape, size, spacing, and color
- Eyebrow thickness, arch, and placement
- Nose bridge width, tip shape, and nostril flare
- Lip shape, fullness, and cupid's bow
- Jaw structure, cheekbone placement, and face shape
- Skin tone and complexion
- Any distinctive features: freckles, dimples, facial hair, glasses, birthmarks — keep all of them
- Hair color, texture, and general style (can be stylized but must remain recognizable)

Think: Hollywood VFX superhero transformation. Not a different person. Not a lookalike. THE SAME PERSON — but transformed.

== PRIORITY #2: CREATIVE AI EFFECTS APPLIED TO THE FACE ==
Apply this effect directly onto their face and skin — NOT just the background:
${faceEffect}

This must look like the AI has visually enhanced or altered their actual face with this effect — integrated naturally into their skin, eyes, or bone structure. It should feel like part of them, not a filter pasted on top.

== SUPERHERO TRANSFORMATION ==
- Hero type: ${theme}
- Costume: ${costume} with ${colors} color scheme
- The costume and gear should feel like a natural extension of this specific person's energy and personality
- Add power effects, aura, or energy emanating from them that match the hero type

== PERSONALITY & HUMOR ==
- Add this playful element: ${humor}
- Keep a sense of fun and personality — this is a superhero version of a real person, not a stock hero template

== SCENE COMPOSITION ==
- Pose: ${pose}
- Background: ${background}
- Lighting: ${lighting}
- Style: Cinematic superhero movie poster quality, with visible AI/digital aesthetic woven throughout

== FINAL GOAL ==
The result should make the subject laugh and say: "That's absolutely me — but as a superhero!" — recognizable face, epic powers, creative AI transformation effects applied directly to their features.`;
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

  const MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-image";

  // Convert buffer to base64 data URI
  const base64Image = imageBuffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64Image}`;

  // Generate a randomized superhero prompt for variety
  const prompt = generateRandomSuperheroPrompt();

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
