import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, streams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { mux, MUX_RTMP_URL } from "@/lib/mux";
import { CopyButton } from "./copy-button";

async function ensureUserAndStream() {
  console.log("[dashboard] Starting ensureUserAndStream");

  const { userId } = await auth();
  console.log("[dashboard] auth() returned userId:", userId ? "present" : "null");
  if (!userId) return null;

  const user = await currentUser();
  console.log("[dashboard] currentUser() returned:", user ? "present" : "null");
  if (!user) return null;

  // Ensure user exists
  console.log("[dashboard] Querying for existing user");
  let existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  console.log("[dashboard] Existing user:", existingUser ? "found" : "not found");

  if (!existingUser) {
    console.log("[dashboard] Creating new user");
    const [newUser] = await db.insert(users).values({
      id: userId,
      email: user.emailAddresses[0]?.emailAddress ?? "",
      displayName: user.firstName || user.username || "Streamer",
    }).returning();
    existingUser = newUser;
    console.log("[dashboard] User created");
  }

  // Ensure stream exists (singleton per user)
  console.log("[dashboard] Querying for existing stream");
  let userStream = await db.query.streams.findFirst({
    where: eq(streams.userId, userId),
  });
  console.log("[dashboard] Existing stream:", userStream ? "found" : "not found");

  if (!userStream) {
    console.log("[dashboard] Creating Mux live stream");
    console.log("[dashboard] MUX_TOKEN_ID present:", !!process.env.MUX_TOKEN_ID);
    console.log("[dashboard] MUX_TOKEN_SECRET present:", !!process.env.MUX_TOKEN_SECRET);

    const liveStream = await mux.video.liveStreams.create({
      playback_policy: ["public"],
      new_asset_settings: { playback_policy: ["public"] },
    });
    console.log("[dashboard] Mux stream created:", liveStream.id);

    const playbackId = liveStream.playback_ids?.[0]?.id;

    console.log("[dashboard] Inserting stream into database");
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
    console.log("[dashboard] Stream inserted");
  }

  console.log("[dashboard] Returning data");
  return { user: existingUser, stream: userStream };
}

export default async function DashboardPage() {
  try {
    const data = await ensureUserAndStream();
    if (!data) return null;

    const { stream } = data;

    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stream Status */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Stream Status</h2>
            {stream.isLive ? (
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
          {stream.isLive && stream.muxPlaybackId && (
            <a
              href={`/preview/${stream.muxPlaybackId}`}
              target="_blank"
              className="text-accent hover:underline text-sm"
            >
              View live preview →
            </a>
          )}
        </div>

        {/* OBS Credentials */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">OBS Settings</h2>
          <p className="text-sm text-white/50 mb-6">
            Copy these settings into OBS Studio → Settings → Stream
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

            <div>
              <label className="block text-xs text-white/40 mb-2 uppercase tracking-wide">
                Stream Key
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 bg-black/30 rounded-xl font-mono text-sm text-white/80 break-all">
                  {stream.streamKey}
                </code>
                <CopyButton text={stream.streamKey} />
              </div>
            </div>
          </div>
        </div>

        {/* OpenClaw CLI */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Add Livestream Skill to OpenClaw</h2>
          <p className="text-sm text-white/50 mb-6">
            Let your AI agent control your stream with the Crawd CLI
          </p>

          <div className="bg-black/30 rounded-xl p-4 font-mono text-sm space-y-2">
            <p className="text-white/40"># Install the CLI</p>
            <p className="text-white/80">npm install -g @crawd/cli</p>
            <p className="text-white/80 mt-4"></p>
            <p className="text-white/40"># Authenticate</p>
            <p className="text-white/80">crawd auth</p>
            <p className="text-white/80 mt-4"></p>
            <p className="text-white/40"># Install the livestream skill</p>
            <p className="text-white/80">crawd skill install livestream</p>
            <p className="text-white/80 mt-4"></p>
            <p className="text-white/40"># Control your stream</p>
            <p className="text-white/80">crawd stream start</p>
            <p className="text-white/80">crawd stream stop</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("[dashboard] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("[dashboard] Error stack:", errorStack);

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
