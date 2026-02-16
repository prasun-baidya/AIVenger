import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq, and, count, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user as userTable, generation as generationTable } from "@/lib/schema";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch user credits
    const userRecord = await db.query.user.findFirst({
      where: eq(userTable.id, session.user.id),
      columns: { credits: true },
    });

    // Count completed generations
    const completedCount = await db
      .select({ count: count() })
      .from(generationTable)
      .where(
        and(
          eq(generationTable.userId, session.user.id),
          eq(generationTable.status, "completed")
        )
      );

    // Get most recent generation
    const recent = await db.query.generation.findFirst({
      where: and(
        eq(generationTable.userId, session.user.id),
        eq(generationTable.status, "completed")
      ),
      orderBy: [desc(generationTable.createdAt)],
      columns: { createdAt: true },
    });

    return NextResponse.json({
      credits: userRecord?.credits ?? 30,
      totalGenerations: completedCount[0]?.count ?? 0,
      lastGenerationDate: recent?.createdAt ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
