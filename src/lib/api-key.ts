import { createHash, randomBytes } from "crypto";

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  // Generate a random key: crawd_live_<random>
  const random = randomBytes(24).toString("base64url");
  const key = `crawd_live_${random}`;

  // Hash the key for storage
  const hash = createHash("sha256").update(key).digest("hex");

  // Get prefix for display
  const prefix = key.slice(0, 16);

  return { key, hash, prefix };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
