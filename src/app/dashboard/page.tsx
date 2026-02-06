import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, streams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { mux, MUX_RTMP_URL, getMuxStreamStatus } from "@/lib/mux";
import { CopyButton } from "./copy-button";
import { SecretField } from "./secret-field";

async function ensureUserAndStream() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  // Ensure user exists
  let existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!existingUser) {
    const [newUser] = await db.insert(users).values({
      id: userId,
      email: user.emailAddresses[0]?.emailAddress ?? "",
      displayName: user.firstName || user.username || "Streamer",
    }).returning();
    existingUser = newUser;
  }

  // Ensure stream exists (singleton per user)
  let userStream = await db.query.streams.findFirst({
    where: eq(streams.userId, userId),
  });

  if (!userStream) {
    const liveStream = await mux.video.liveStreams.create({
      playback_policy: ["public"],
      new_asset_settings: { playback_policy: ["public"] },
    });

    const playbackId = liveStream.playback_ids?.[0]?.id;

    const [newStream] = await db
      .insert(streams)
      .values({
        id: nanoid(),
        userId,
        name: existingUser.displayName || "My Stream",
        streamKey: liveStream.stream_key!,
        muxLiveStreamId: liveStream.id,
        muxPlaybackId: playbackId,
      })
      .returning();
    userStream = newStream;
  }

  return { user: existingUser, stream: userStream };
}

export default async function DashboardPage() {
  try {
    const data = await ensureUserAndStream();
    if (!data) return null;

    const { stream } = data;

    const isLive = stream.muxLiveStreamId
      ? (await getMuxStreamStatus(stream.muxLiveStreamId)).isLive
      : false;

    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stream Card */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-semibold">Stream</h2>
            {isLive ? (
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                LIVE
              </span>
            ) : (
              <span className="px-3 py-1 bg-white/10 text-white/50 text-sm rounded-lg">
                Offline
              </span>
            )}
          </div>

          {isLive && stream.muxPlaybackId && (
            <a
              href={`/preview/${stream.muxPlaybackId}`}
              target="_blank"
              className="inline-block mb-6 text-accent hover:underline text-sm"
            >
              View live preview →
            </a>
          )}

          <p className="text-sm text-white/50 mb-4">
            OBS Studio → Settings → Stream
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/40 mb-2 uppercase tracking-wide">
                Server
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 bg-black/30 rounded-xl font-mono text-sm text-white/80">
                  {MUX_RTMP_URL}
                </code>
                <CopyButton text={MUX_RTMP_URL} />
              </div>
            </div>

            <SecretField value={stream.streamKey} label="Stream Key" />
          </div>
        </div>

        {/* CLI Quick Start */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Crawd CLI</h2>
          <p className="text-sm text-white/50">
            Control your stream programmatically with the CLI.{" "}
            <a
              href="https://github.com/crawd-bot/crawd-cli/tree/main?tab=readme-ov-file#quick-start"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Quick start guide →
            </a>
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error("[dashboard] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Error loading dashboard</h2>
          <p className="text-white/50 text-sm mb-4">{errorMessage}</p>
          <details className="text-xs text-white/30">
            <summary className="cursor-pointer">Debug info</summary>
            <pre className="mt-2 overflow-auto">{errorStack || "No stack trace"}</pre>
          </details>
        </div>
      </div>
    );
  }
}
