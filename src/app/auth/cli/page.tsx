import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { apiKeys, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { generateApiKey } from "@/lib/api-key";
import { CliAuthConfirm } from "./confirm";

type Props = {
  searchParams: Promise<{ callback?: string; confirmed?: string }>;
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

function isCallbackAllowed(callback: string): boolean {
  try {
    const url = new URL(callback);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export default async function CliAuthPage({ searchParams }: Props) {
  const { callback, confirmed } = await searchParams;
  const { userId } = await auth();

  if (!userId) {
    const returnUrl = callback
      ? `/auth/cli?callback=${encodeURIComponent(callback)}`
      : "/auth/cli";
    redirect(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Validate callback URL — only allow localhost
  if (callback && !isCallbackAllowed(callback)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md w-full p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Invalid Callback</h1>
          <p className="text-white/50">
            The callback URL must point to localhost. This request looks suspicious.
          </p>
        </div>
      </div>
    );
  }

  // Step 1: Show confirmation page (user hasn't confirmed yet)
  if (confirmed !== "true") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md w-full p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Authorize CLI</h1>
          <p className="text-white/50 text-center mb-8">
            The crawd CLI is requesting access to your account.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Account</span>
              <span className="text-white/80">
                {user.emailAddresses[0]?.emailAddress}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Permission</span>
              <span className="text-white/80">Full API access</span>
            </div>
            {callback && (
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Callback</span>
                <span className="text-white/80 font-mono text-xs">{callback}</span>
              </div>
            )}
          </div>

          <CliAuthConfirm callback={callback} />

          <p className="text-white/20 text-xs text-center mt-6">
            This will generate an API key for CLI access.
            You can revoke it from your dashboard at any time.
          </p>
        </div>
      </div>
    );
  }

  // Step 2: User confirmed — generate key and redirect
  await ensureUser(
    userId,
    user.emailAddresses[0]?.emailAddress ?? "",
    user.firstName || user.username || undefined
  );

  const { key, hash, prefix } = generateApiKey();

  await db.insert(apiKeys).values({
    id: nanoid(),
    userId,
    name: "CLI",
    keyHash: hash,
    keyPrefix: prefix,
  });

  if (callback) {
    const callbackUrl = new URL(callback);
    callbackUrl.searchParams.set("token", key);
    redirect(callbackUrl.toString());
  }

  // No callback — show the key directly (fallback)
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
