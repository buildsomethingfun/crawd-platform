import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { streams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authenticateApiKey } from "@/lib/auth-api-key";

/**
 * POST /api/stream/stop - Set the user's stream to offline
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

  if (!stream.isLive) {
    return NextResponse.json({ message: "Stream is already offline", stream: { isLive: false } });
  }

  await db
    .update(streams)
    .set({ isLive: false, updatedAt: new Date() })
    .where(eq(streams.id, stream.id));

  return NextResponse.json({
    message: "Stream stopped",
    stream: { isLive: false },
  });
}
