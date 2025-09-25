// src/utils/token.js
import crypto from "crypto";

/** Génère un token brut + hashé + dates (TTL en minutes) */
export function genToken(bytes = 32, ttlMinutes = 60) {
  const token = crypto.randomBytes(bytes).toString("base64url"); // à envoyer dans l'URL
  const token_hash = hashToken(token); // ce qu'on stocke en DB
  const created_at = new Date();
  const expires_at = new Date(created_at.getTime() + ttlMinutes * 60 * 1000);
  return { token, token_hash, created_at, expires_at };
}

/** Hash SHA-256 du token brut (ne jamais stocker le token en clair) */
export function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
