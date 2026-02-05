import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { streams } from "@/db/schema";
import { eq } from "drizzle-orm";

function generateStreamKey(): string {
  return `live_${nanoid(32)}`;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userStreams = await db.query.streams.findMany({
    where: eq(streams.userId, userId),
    orderBy: (streams, { desc }) => [desc(streams.createdAt)],
  });

  return NextResponse.json({ streams: userStreams });
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

  const streamKey = generateStreamKey();

  const [stream] = await db
    .insert(streams)
    .values({
      id: nanoid(),
      userId,
      name,
      streamKey,
    })
    .returning();

  return NextResponse.json({ stream });
}
