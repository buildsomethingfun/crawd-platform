import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { streams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authenticateApiKey } from "@/lib/auth-api-key";
import { mux } from "@/lib/mux";

/**
 * POST /api/stream/start - Enable the user's Mux live stream
 * Requires API key auth: Authorization: Bearer crawd_live_...
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stream = await db.query.streams.findFirst({
    where: eq(streams.userId, auth.userId),
  });

  if (!stream) {
    return NextResponse.json({ error: "No stream found" }, { status: 404 });
  }

  if (!stream.muxLiveStreamId) {
    return NextResponse.json({ error: "No Mux stream configured" }, { status: 400 });
  }

  // Enable the live stream on Mux — this allows RTMP ingest
  await mux.video.liveStreams.enable(stream.muxLiveStreamId);

  await db
    .update(streams)
    .set({ isLive: true, updatedAt: new Date() })
    .where(eq(streams.id, stream.id));

  return NextResponse.json({
    message: "Stream started",
    stream: { isLive: true },
  });
}
