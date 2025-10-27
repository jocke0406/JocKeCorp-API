import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.js";

const app = express();

/** Express derrière Nginx : nécessaire pour IP/RateLimit/HTTPS */
app.set("trust proxy","127.0.0.1");

app.use(express.json());
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

/** Helmet (CSP désactivée si Angular/inline) */
app.use(helmet({ contentSecurityPolicy: false }));

/** CORS — géré UNIQUEMENT ici, pas dans Nginx */
const allowedOrigins = [
  "https://jocke.be",
  "http://localhost:4200",
  "http://127.0.0.1:4200",
];

const corsOptions = {
  origin(origin, cb) {
    // Autoriser requêtes sans Origin (curl, healthchecks)
    if (!origin) return cb(null, true);
    return cb(null, allowedOrigins.includes(origin));
  },
  credentials: false, // passe à true si TU utilises des cookies de session
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// ⚠️ Ne pas remettre de app.options('*', ...) avec Express 5

/** Rate limit (protège /auth, utilise l'IP via trust proxy) */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/auth", authLimiter);

/** Health */
app.get("/health", (_req, res) => res.json({ ok: true }));

/** Log simple */
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

/** Routes applicatives */
app.use("/", routes);

/** 404 JSON propre */
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

export default app;

