import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { apiKeys, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { generateApiKey } from "@/lib/api-key";

type Props = {
  searchParams: Promise<{ callback?: string }>;
};

async function ensureUser(userId: string, email: string, name?: string) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!existingUser) {
    await db.insert(users).values({
      id: userId,
      email,
      displayName: name || "Streamer",
    });
  }

  return existingUser || { id: userId, email, displayName: name };
}

export default async function CliAuthPage({ searchParams }: Props) {
  const { callback } = await searchParams;
  const { userId } = await auth();

  if (!userId) {
    // Redirect to sign-in, then back here
    const returnUrl = callback
      ? `/auth/cli?callback=${encodeURIComponent(callback)}`
      : "/auth/cli";
    redirect(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Ensure user exists in our database
  await ensureUser(
    userId,
    user.emailAddresses[0]?.emailAddress ?? "",
    user.firstName || user.username
  );

  // Generate API key for CLI
  const { key, hash, prefix } = generateApiKey();

  await db.insert(apiKeys).values({
    id: nanoid(),
    userId,
    name: "CLI",
    keyHash: hash,
    keyPrefix: prefix,
  });

  // If we have a callback URL, redirect there with the token
  if (callback) {
    const callbackUrl = new URL(callback);
    callbackUrl.searchParams.set("token", key);
    redirect(callbackUrl.toString());
  }

  // No callback - show the key directly (fallback)
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full p-8">
        <h1 className="text-2xl font-bold text-center mb-6">CLI Authenticated</h1>
        <p className="text-white/50 text-center mb-6">
          Copy this API key to your CLI. You won&apos;t be able to see it again.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <code className="text-sm break-all text-white/80">{key}</code>
        </div>
        <p className="text-white/30 text-xs text-center">
          Run: <code className="text-white/50">crawd config set apiKey {prefix}...</code>
        </p>
      </div>
    </div>
  );
}
