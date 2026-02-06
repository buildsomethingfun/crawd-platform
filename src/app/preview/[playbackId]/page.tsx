import Script from "next/script";
import { db } from "@/db";
import { streams, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ playbackId: string }>;
}) {
  const { playbackId } = await params;

  const stream = await db.query.streams.findFirst({
    where: eq(streams.muxPlaybackId, playbackId),
  });

  const user = stream
    ? await db.query.users.findFirst({
        where: eq(users.id, stream.userId),
      })
    : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Script src="https://cdn.jsdelivr.net/npm/@mux/mux-player" />

      <div className="max-w-5xl mx-auto p-4">
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
          {/* @ts-expect-error - mux-player is a web component */}
          <mux-player
            playback-id={playbackId}
            stream-type="live"
            autoplay="muted"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          {user?.displayName && (
            <h2 className="text-lg font-semibold text-white">
              {user.displayName}
            </h2>
          )}
          {user?.bio && (
            <p className="mt-1 text-sm text-gray-400">{user.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}
