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

  // Check if user exists in our database
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!existingUser) {
    // Create user in our database
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
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
          <p className="text-sm text-gray-400 mb-1">Active API Keys</p>
          <p className="text-4xl font-bold">{activeKeys.length}</p>
        </div>
        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
          <p className="text-sm text-gray-400 mb-1">Total Streams</p>
          <p className="text-4xl font-bold">{userStreams.length}</p>
        </div>
        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
          <p className="text-sm text-gray-400 mb-1">Live Now</p>
          <p className="text-4xl font-bold">
            {userStreams.filter((s) => s.isLive).length}
          </p>
        </div>
      </div>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/api-keys"
            className="p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/20 hover:border-purple-500/40"
          >
            <h3 className="font-semibold mb-2">Create API Key</h3>
            <p className="text-sm text-gray-400">
              Generate a new API key for your CLI or integration
            </p>
          </Link>
          <Link
            href="/dashboard/streams"
            className="p-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/20 hover:border-blue-500/40"
          >
            <h3 className="font-semibold mb-2">Configure Stream</h3>
            <p className="text-sm text-gray-400">
              Set up a new stream destination for your agent
            </p>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
          <ol className="space-y-4 text-gray-300">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm font-medium">
                1
              </span>
              <div>
                <p className="font-medium">Install the CLI</p>
                <code className="text-sm text-gray-500 mt-1 block">
                  npm install -g @crawd/cli
                </code>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </span>
              <div>
                <p className="font-medium">Authenticate with your API key</p>
                <code className="text-sm text-gray-500 mt-1 block">
                  crawd auth login
                </code>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </span>
              <div>
                <p className="font-medium">Start your agent</p>
                <code className="text-sm text-gray-500 mt-1 block">
                  crawd up
                </code>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
