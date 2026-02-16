import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY not configured" },
      { status: 500 }
    );
  }

  // Test with a simple publicly accessible image
  const testImageUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/400px-Cat03.jpg";

  const MODEL = "google/gemini-2.5-flash-image";
  const prompt = `Transform this into a superhero character.`;

  try {
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
                  image_url: { url: testImageUrl },
                },
              ],
            },
          ],
          modalities: ["image", "text"],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: { message: "Unknown error" } }));
      return NextResponse.json(
        {
          error: "OpenRouter API failed",
          status: response.status,
          statusText: response.statusText,
          details: errorData,
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Try to extract image URL from images field (correct format for Gemini)
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    return NextResponse.json({
      success: true,
      imageUrl,
      fullResponse: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Exception occurred",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
