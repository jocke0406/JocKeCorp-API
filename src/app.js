import express from "express";
import routes from "./routes/index.js";

const app = express();
app.use(express.json());

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// API
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});
app.use("/", routes);

// 404 JSON propre
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

export default app;
