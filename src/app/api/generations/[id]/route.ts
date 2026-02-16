import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generation as generationTable } from "@/lib/schema";
import { deleteFile } from "@/lib/storage";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify ownership
    const generation = await db.query.generation.findFirst({
      where: and(
        eq(generationTable.id, id),
        eq(generationTable.userId, session.user.id)
      ),
    });

    if (!generation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete images from blob storage
    await deleteFile(generation.originalImageUrl);
    if (generation.generatedImageUrl) {
      await deleteFile(generation.generatedImageUrl);
    }

    // Delete database record
    await db.delete(generationTable).where(eq(generationTable.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
