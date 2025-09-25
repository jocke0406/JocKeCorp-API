import { MongoClient } from "mongodb";

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) throw new Error("❌ Missing MONGODB_URI");

let _client, _db;

export async function connectMongo() {
  if (_db) return _db;
  _client = new MongoClient(MONGODB_URI);
  await _client.connect();
  _db = _client.db();
  console.log("✅ Mongo connecté");
  return _db;
}

export function getDb() {
  if (!_db)
    throw new Error("DB non initialisée — appelle connectMongo() au démarrage");
  return _db;
}

export function getCollection(name) {
  return getDb().collection(name);
}
