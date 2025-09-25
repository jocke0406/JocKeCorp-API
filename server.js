// server.js
import "dotenv/config";
import { createServer } from "http";
import app from "./src/app.js";
import { connectMongo } from "./src/db/client.js";
import { ensureTokensCollection } from "./src/controllers/tokens.setup.js";

const PORT = process.env.PORT || 3000;

await connectMongo();
await ensureTokensCollection(); // 👈 prépare la collection tokens + index

createServer(app).listen(PORT, () => {
  console.log(`🚀 JockeCorp API on http://localhost:${PORT}`);
});
