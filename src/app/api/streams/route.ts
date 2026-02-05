import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { streams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { mux, MUX_RTMP_URL } from "@/lib/mux";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userStreams = await db.query.streams.findMany({
    where: eq(streams.userId, userId),
    orderBy: (streams, { desc }) => [desc(streams.createdAt)],
  });

  return NextResponse.json({
    streams: userStreams.map((s) => ({
      ...s,
      rtmpUrl: MUX_RTMP_URL,
    })),
  });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Create Mux live stream
  const liveStream = await mux.video.liveStreams.create({
    playback_policy: ["public"],
    new_asset_settings: { playback_policy: ["public"] },
  });

  const playbackId = liveStream.playback_ids?.[0]?.id;

  const [stream] = await db
    .insert(streams)
    .values({
      id: nanoid(),
      userId,
      name,
      streamKey: liveStream.stream_key!,
      muxLiveStreamId: liveStream.id,
      muxPlaybackId: playbackId,
    })
    .returning();

  return NextResponse.json({
    stream: {
      ...stream,
      rtmpUrl: MUX_RTMP_URL,
    },
  });
}
