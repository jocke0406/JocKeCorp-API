// src/db/client.js
import { MongoClient } from 'mongodb';
import { cfg } from '../config/env.js';

let _client;
let _db;

/**
 * Connexion unique MongoDB
 * - Utilise cfg.MONGODB_URI (obligatoire)
 * - Si cfg.DB_NAME est défini, l'utilise pour sélectionner la base
 *   sinon, Mongo prend celle de l'URI.
 */
export async function connectMongo(uri = cfg.MONGODB_URI, dbName = cfg.DB_NAME || undefined) {
  if (_db) return _db;

  _client = new MongoClient(uri, {
    // options modern Mongo driver si besoin (garde par défaut si OK)
    // serverSelectionTimeoutMS: 10000,
  });

  await _client.connect();
  _db = dbName ? _client.db(dbName) : _client.db();

  console.log('✅ Mongo connecté');
  return _db;
}

export function getDb() {
  if (!_db) {
    throw new Error('DB non initialisée — appelle connectMongo() au démarrage');
  }
  return _db;
}

export function getCollection(name) {
  return getDb().collection(name);
}
