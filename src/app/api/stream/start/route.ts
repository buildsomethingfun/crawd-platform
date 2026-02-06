import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { streams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authenticateApiKey } from "@/lib/auth-api-key";
import { getMuxStreamStatus } from "@/lib/mux";

/**
 * POST /api/stream/start - No-op. Streams go live automatically when OBS connects.
 * Kept for CLI backwards compatibility.
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

  const { isLive } = stream.muxLiveStreamId
    ? await getMuxStreamStatus(stream.muxLiveStreamId)
    : { isLive: false };

  return NextResponse.json({
    message: isLive
      ? "Stream is already live"
      : "Stream is ready — start OBS to go live automatically",
    stream: { isLive },
  });
}
