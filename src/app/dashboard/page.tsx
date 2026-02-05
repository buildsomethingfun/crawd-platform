import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { db } from "@/db";
import { users, apiKeys, streams } from "@/db/schema";
import { eq } from "drizzle-orm";

async function ensureUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!existingUser) {
    await db.insert(users).values({
      id: userId,
      email: user.emailAddresses[0]?.emailAddress ?? "",
    });
  }

  return userId;
}

export default async function DashboardPage() {
  const userId = await ensureUser();
  if (!userId) return null;

  const [userApiKeys, userStreams] = await Promise.all([
    db.query.apiKeys.findMany({
      where: eq(apiKeys.userId, userId),
    }),
    db.query.streams.findMany({
      where: eq(streams.userId, userId),
    }),
  ]);

  const activeKeys = userApiKeys.filter((k) => k.isActive);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Overview</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-white/50 mb-1">Active API Keys</p>
          <p className="text-4xl font-bold">{activeKeys.length}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-white/50 mb-1">Total Streams</p>
          <p className="text-4xl font-bold">{userStreams.length}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-white/50 mb-1">Live Now</p>
          <p className="text-4xl font-bold">
            {userStreams.filter((s) => s.isLive).length}
          </p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4 text-white/70">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/streams"
            className="glass rounded-2xl p-6 hover:bg-white/10 transition-colors group"
          >
            <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors">Create Stream</h3>
            <p className="text-sm text-white/50">
              Set up a new stream and get your OBS credentials
            </p>
          </Link>
          <Link
            href="/dashboard/api-keys"
            className="glass rounded-2xl p-6 hover:bg-white/10 transition-colors group"
          >
            <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors">Generate API Key</h3>
            <p className="text-sm text-white/50">
              Create a key for CLI or integrations
            </p>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-white/70">Getting Started</h2>
        <div className="glass rounded-2xl p-6">
          <ol className="space-y-4 text-white/80">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 accent-gradient rounded-full flex items-center justify-center text-sm font-bold text-black">
                1
              </span>
              <div>
                <p className="font-medium">Create a stream</p>
                <p className="text-sm text-white/50 mt-1">
                  Go to Streams and create your first stream
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 accent-gradient rounded-full flex items-center justify-center text-sm font-bold text-black">
                2
              </span>
              <div>
                <p className="font-medium">Configure OBS</p>
                <p className="text-sm text-white/50 mt-1">
                  Use the RTMP URL and stream key in OBS
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 accent-gradient rounded-full flex items-center justify-center text-sm font-bold text-black">
                3
              </span>
              <div>
                <p className="font-medium">Go live</p>
                <p className="text-sm text-white/50 mt-1">
                  Start streaming and share your preview link
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
