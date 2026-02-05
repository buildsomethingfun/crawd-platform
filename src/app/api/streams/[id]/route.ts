import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { streams } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { mux } from "@/lib/mux";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const stream = await db.query.streams.findFirst({
    where: and(eq(streams.id, id), eq(streams.userId, userId)),
  });

  if (!stream) {
    return NextResponse.json({ error: "Stream not found" }, { status: 404 });
  }

  // Delete from Mux if it exists
  if (stream.muxLiveStreamId) {
    try {
      await mux.video.liveStreams.delete(stream.muxLiveStreamId);
    } catch {
      // Ignore if already deleted in Mux
    }
  }

  await db.delete(streams).where(eq(streams.id, id));

  return NextResponse.json({ success: true });
}
