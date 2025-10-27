// server.js (ESM)
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1) Charger .env AVANT d'importer quoi que ce soit qui lit process.env
const envPath = resolve(__dirname, '.env');
const loaded = dotenv.config({ path: envPath });

console.log('[BOOT] .env path =', envPath, 'exists =', fs.existsSync(envPath));
if (loaded.error) {
  console.error('[BOOT] dotenv error:', loaded.error);
}

// 2) Importer ensuite la config qui valide les vars
const { cfg } = await import('./src/config/env.js');
const { createServer } = await import('http');
const { default: app } = await import('./src/app.js');
const { connectMongo } = await import('./src/db/client.js');
const { ensureAllIndexes } = await import('./src/db/init.js');

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
