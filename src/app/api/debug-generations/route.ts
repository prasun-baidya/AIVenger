import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { generation as generationTable } from "@/lib/schema";

export async function GET() {
  try {
    const recentGenerations = await db.query.generation.findMany({
      orderBy: [desc(generationTable.createdAt)],
      limit: 10,
    });

    const stats = {
      total: recentGenerations.length,
      pending: recentGenerations.filter((g) => g.status === "pending").length,
      completed: recentGenerations.filter((g) => g.status === "completed")
        .length,
      failed: recentGenerations.filter((g) => g.status === "failed").length,
    };

    const failedGenerations = recentGenerations
      .filter((g) => g.status === "failed")
      .map((g) => ({
        id: g.id,
        status: g.status,
        errorMessage: g.errorMessage,
        createdAt: g.createdAt,
        userId: g.userId,
      }));

    return NextResponse.json({
      stats,
      failedGenerations,
      recentGenerations: recentGenerations.map((g) => ({
        id: g.id,
        status: g.status,
        createdAt: g.createdAt,
        hasOriginal: !!g.originalImageUrl,
        hasGenerated: !!g.generatedImageUrl,
        errorMessage: g.errorMessage,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch generations",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
