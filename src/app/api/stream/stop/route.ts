import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { streams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authenticateApiKey } from "@/lib/auth-api-key";
import { mux } from "@/lib/mux";

/**
 * POST /api/stream/stop - Disconnect OBS and stop the live stream.
 * Disables then immediately re-enables the Mux stream so the RTMP
 * endpoint is ready for the next session.
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

  // Disable to cut the active RTMP connection (disconnects OBS)
  await mux.video.liveStreams.disable(stream.muxLiveStreamId);
  // Re-enable immediately so the RTMP endpoint is ready for next session
  await mux.video.liveStreams.enable(stream.muxLiveStreamId);

  return NextResponse.json({
    message: "Stream stopped",
    stream: { isLive: false },
  });
}
