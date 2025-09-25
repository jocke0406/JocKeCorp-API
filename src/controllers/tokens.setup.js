import { getDb } from "../db/client.js";

export async function ensureTokensCollection() {
  const db = getDb();
  const Tokens = db.collection("tokens");

  // Unicité du hash de token
  await Tokens.createIndex({ token_hash: 1 }, { unique: true });

  // TTL sur expires_at: suppression auto dès expiration
  await Tokens.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });

  // Accès fréquent
  await Tokens.createIndex({ user_id: 1, purpose: 1 });

  return Tokens;
}
