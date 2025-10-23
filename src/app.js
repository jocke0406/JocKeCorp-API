// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import routes from './routes/index.js';
import { cfg } from './config/env.js';

const app = express();

// Derrière Nginx/proxy → nécessaire pour que req.ip et rate-limit soient corrects
app.set('trust proxy', 1);

// JSON parser
app.use(express.json());

// No-store par défaut (API)
app.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Helmet (CSP désactivé si tu seras amené à servir un front ailleurs)
app.use(helmet({ contentSecurityPolicy: false }));

const ALLOWED_ORIGINS = cfg.APP_ORIGINS;
console.log('[CORS] allowed origins:', ALLOWED_ORIGINS);

app.use(
  cors({
    origin(origin, cb) {
      // Requêtes sans Origin (curl/Postman/health checks) → OK
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    // Mets true UNIQUEMENT si tu utilises des cookies/credentials cross-site
    credentials: false,
    // Autorise les headers courants
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator(),
});
app.use('/auth', authLimiter);

// --------- Health ----------
app.get('/health', (_req, res) => res.json({ ok: true }));

// --------- Logs compacts ----------
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

// --------- Routes ----------
app.use('/', routes);

// 404 JSON
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

export default app;
