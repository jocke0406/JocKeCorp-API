// src/config/env.js
import { cleanEnv, str, url, num, bool, makeValidator } from 'envalid';

const csv = makeValidator((input) => {
  if (!input) return [];
  return String(input)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
});

export const cfg = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  PORT: num({ default: 3000 }),

  MONGODB_URI: str(),
  DB_NAME: str({ default: '' }),

  APP_BASE_URL: url({ default: 'http://localhost:4200' }),
  APP_ORIGINS: csv({ default: 'http://localhost:4200' }),

  SMTP_HOST: str(),
  SMTP_PORT: num({ default: 587 }),
  SMTP_SECURE: bool({ default: false }),
  SMTP_USER: str(),
  SMTP_PASS: str(),
  MAIL_FROM: str(),
});
