import { NextRequest } from "next/server";
import { db } from "@/db";
import { apiKeys, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashApiKey } from "./api-key";

export type AuthResult = {
  userId: string;
  apiKeyId: string;
} | null;

/**
 * Authenticate a request using an API key from the Authorization header.
 * Expected format: "Bearer crawd_live_..."
 */
export async function authenticateApiKey(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const apiKey = authHeader.slice(7); // Remove "Bearer "
  if (!apiKey.startsWith("crawd_live_")) {
    return null;
  }

  const keyHash = hashApiKey(apiKey);

  const key = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.keyHash, keyHash),
  });

  if (!key || !key.isActive) {
    return null;
  }

  // Update last used timestamp
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, key.id));

  return {
    userId: key.userId,
    apiKeyId: key.id,
  };
}
