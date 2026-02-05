import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { streams } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify the stream belongs to the user
  const stream = await db.query.streams.findFirst({
    where: and(eq(streams.id, id), eq(streams.userId, userId)),
  });

  if (!stream) {
    return NextResponse.json({ error: "Stream not found" }, { status: 404 });
  }

  await db.delete(streams).where(eq(streams.id, id));

  return NextResponse.json({ success: true });
}
