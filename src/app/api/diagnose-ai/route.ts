import { NextResponse } from "next/server";

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      hasApiKey: !!process.env.OPENROUTER_API_KEY,
      apiKeyPrefix: process.env.OPENROUTER_API_KEY?.substring(0, 10),
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      configuredModel: process.env.OPENROUTER_MODEL,
    },
    tests: [] as Array<{ name: string; status: string; details?: any }>,
  };

  // Test 1: Check if API key is valid
  if (!process.env.OPENROUTER_API_KEY) {
    diagnostics.tests.push({
      name: "API Key Check",
      status: "FAILED",
      details: "OPENROUTER_API_KEY not found in environment",
    });
    return NextResponse.json(diagnostics);
  }

  diagnostics.tests.push({
    name: "API Key Check",
    status: "PASSED",
  });

  // Test 2: Check API connectivity
  try {
    const modelsResponse = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    });

    if (modelsResponse.ok) {
      diagnostics.tests.push({
        name: "API Connectivity",
        status: "PASSED",
      });

      // Test 3: Check if gemini-2.5-flash-image exists
      const modelsData = await modelsResponse.json();
      const targetModel = modelsData.data?.find(
        (m: { id: string }) => m.id === "google/gemini-2.5-flash-image"
      );

      if (targetModel) {
        diagnostics.tests.push({
          name: "Model Availability",
          status: "PASSED",
          details: {
            id: targetModel.id,
            name: targetModel.name,
            description: targetModel.description,
            pricing: targetModel.pricing,
            context_length: targetModel.context_length,
          },
        });
      } else {
        diagnostics.tests.push({
          name: "Model Availability",
          status: "FAILED",
          details: "google/gemini-2.5-flash-image not found in available models",
        });

        // Find similar models
        const similarModels = modelsData.data
          ?.filter(
            (m: { id: string }) =>
              m.id.includes("gemini") || m.id.includes("image")
          )
          .map((m: { id: string; name: string }) => ({
            id: m.id,
            name: m.name,
          }));

        diagnostics.tests.push({
          name: "Alternative Models",
          status: "INFO",
          details: similarModels?.slice(0, 10),
        });
      }
    } else {
      diagnostics.tests.push({
        name: "API Connectivity",
        status: "FAILED",
        details: {
          status: modelsResponse.status,
          statusText: modelsResponse.statusText,
        },
      });
    }
  } catch (error) {
    diagnostics.tests.push({
      name: "API Connectivity",
      status: "ERROR",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }

  // Test 4: Check account credits
  try {
    const creditsResponse = await fetch(
      "https://openrouter.ai/api/v1/auth/key",
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
      }
    );

    if (creditsResponse.ok) {
      const creditsData = await creditsResponse.json();
      diagnostics.tests.push({
        name: "Account Credits",
        status: "PASSED",
        details: creditsData.data,
      });
    } else {
      diagnostics.tests.push({
        name: "Account Credits",
        status: "WARNING",
        details: "Could not fetch credit information",
      });
    }
  } catch (error) {
    diagnostics.tests.push({
      name: "Account Credits",
      status: "WARNING",
      details: "Could not check credits",
    });
  }

  return NextResponse.json(diagnostics);
}
