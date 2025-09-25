import "dotenv/config";
import { createServer } from "http";
import app from "./src/app.js";
import { connectMongo } from "./src/db/client.js";

const PORT = process.env.PORT || 3000;

await connectMongo();
createServer(app).listen(PORT, () => {
  console.log(`🚀 JockeCorp API on http://localhost:${PORT}`);
});
