// server.js
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1) Charger .env AVANT tout le reste (et de façon absolue)
dotenv.config({ path: resolve(__dirname, '.env') });

// 2) Importer dynamiquement APRÈS que process.env soit prêt
const { cfg } = await import('./src/config/env.js');
const { createServer } = await import('http');
const { default: app } = await import('./src/app.js');
const { connectMongo } = await import('./src/db/client.js');
import { ensureAllIndexes } from './src/db/init.js';

async function bootstrap() {
  try {
    await connectMongo(cfg.MONGODB_URI, cfg.DB_NAME || undefined);
    await ensureAllIndexes();
    createServer(app).listen(cfg.PORT, () => {
      console.log(`🚀 JockeCorp API on http://localhost:${cfg.PORT}`);
    });
  } catch (e) {
    console.error('❌ BOOT FAILURE:', e);
    process.exit(1);
  }
}
bootstrap();
