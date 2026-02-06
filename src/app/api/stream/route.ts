import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { streams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authenticateApiKey } from "@/lib/auth-api-key";
import { MUX_RTMP_URL, getMuxStreamStatus } from "@/lib/mux";

/**
 * GET /api/stream - Get the authenticated user's stream
 * Requires API key auth: Authorization: Bearer crawd_live_...
 */
export async function GET(request: NextRequest) {
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

  const { isLive } = stream.muxLiveStreamId
    ? await getMuxStreamStatus(stream.muxLiveStreamId)
    : { isLive: false };

  return NextResponse.json({
    stream: {
      id: stream.id,
      name: stream.name,
      isLive,
      rtmpUrl: MUX_RTMP_URL,
      streamKey: stream.streamKey,
      playbackId: stream.muxPlaybackId,
    },
  });
}
