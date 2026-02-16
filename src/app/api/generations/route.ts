import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { desc, eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generation as generationTable } from "@/lib/schema";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!)
    : undefined;
  const status = searchParams.get("status") as
    | "pending"
    | "completed"
    | "failed"
    | null;

  try {
    const where = status
      ? and(
          eq(generationTable.userId, session.user.id),
          eq(generationTable.status, status)
        )
      : eq(generationTable.userId, session.user.id);

    const generations = await db.query.generation.findMany({
      where,
      orderBy: [desc(generationTable.createdAt)],
      limit,
    });

    return NextResponse.json({
      generations,
      count: generations.length,
    });
  } catch (error) {
    console.error("Failed to fetch generations:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
