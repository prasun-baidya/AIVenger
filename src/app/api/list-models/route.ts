import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch models",
          status: response.status,
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Filter for gemini image models
    const geminiImageModels = data.data?.filter(
      (model: { id: string }) =>
        model.id.includes("gemini") && model.id.includes("image")
    );

    return NextResponse.json({
      geminiImageModels,
      totalModels: data.data?.length,
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
