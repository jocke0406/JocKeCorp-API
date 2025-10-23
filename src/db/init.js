// src/db/init.js
import { getCollection } from './client.js';

/** Index pour la collection users */
export async function ensureUsersCollection() {
  const Users = getCollection('users');

  // 🔒 email unique
  await Users.createIndex({ email: 1 }, { unique: true });

  // 🔎 requêtes fréquentes (optionnels mais utiles)
  await Users.createIndex({ role: 1 });
  await Users.createIndex({ deleted_at: 1 });
}

/** Appelle tous les initialiseurs d’index */
export async function ensureAllIndexes() {
  // Ton setup existant pour tokens
  const { ensureTokensCollection } = await import('../controllers/tokens.setup.js');

  await ensureUsersCollection();
  await ensureTokensCollection();
}
