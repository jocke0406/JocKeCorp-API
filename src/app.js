import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
console.log("[ENV] ORIGINS =", process.env.APP_ORIGINS);

app.use(helmet({ contentSecurityPolicy: false }));

const raw = process.env.APP_ORIGINS || process.env.APP_ORIGIN || "https://jocke.be";
const ALLOWED_ORIGINS = raw.split(",").map(s => s.trim()).filter(Boolean);

console.log("[CORS] allowed:", ALLOWED_ORIGINS);


app.use(cors({
  origin(origin, cb) {
    // Requêtes sans origin (ex: curl/postman) -> autorise
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true, // mets true si tu utilises des cookies cross-site
}));


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/auth", authLimiter);

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
