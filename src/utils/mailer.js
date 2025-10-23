// src/utils/mailer.js
import nodemailer from 'nodemailer';
import { cfg } from '../config/env.js';

/**
 * Transport SMTP Proximus
 * - Port 587 + STARTTLS => secure: false + requireTLS: true
 * - TLS v1.2 min, rejectUnauthorized: true en prod
 */
export const transporter = nodemailer.createTransport({
  host: cfg.SMTP_HOST,
  port: cfg.SMTP_PORT,
  secure: cfg.SMTP_SECURE, // false pour STARTTLS
  requireTLS: !cfg.SMTP_SECURE, // force l’upgrade TLS si on est en STARTTLS
  auth: { user: cfg.SMTP_USER, pass: cfg.SMTP_PASS },
  tls: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
});

/** Envoi générique (fallback “simulate” si SMTP non configuré) */
export async function sendMail({ to, subject, html, text, replyTo }) {
  if (!cfg.SMTP_HOST) {
    console.log('✉️ [DEV] Email simulé:', { to, subject });
    return { simulated: true };
  }
  return transporter.sendMail({
    from: cfg.MAIL_FROM, // "JocKeCorp <jockecorp@proximus.be>"
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]+>/g, ' '), // fallback texte
    replyTo,
  });
}

/** Templates */
export function renderVerifyEmail({ appBaseUrl = cfg.APP_BASE_URL, token }) {
  const link = `${appBaseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;
  const subject = 'Confirme ton email — JocKeCorp';
  const html = `
  <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;line-height:1.45;color:#111">
    <h2>Bienvenue chez JocKeCorp 👋</h2>
    <p>Pour activer ton compte, confirme ton adresse email :</p>
    <p>
      <a href="${link}" style="display:inline-block;padding:10px 14px;background:#22d3ee;color:#0b0d10;text-decoration:none;border-radius:8px;font-weight:700">
        Confirmer mon email
      </a>
    </p>
    <p>Ou copie-colle ce lien :<br/><code>${link}</code></p>
    <hr style="border:none;border-top:1px solid #ddd;margin:16px 0"/>
    <small>Ce lien expire dans 24h.</small>
  </div>`;
  return { subject, html, link };
}

export function renderResetPassword({ appBaseUrl = cfg.APP_BASE_URL, token }) {
  const link = `${appBaseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
  const subject = 'Réinitialisation de mot de passe — JocKeCorp';
  const html = `
  <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;line-height:1.45;color:#111">
    <h2>Réinitialiser ton mot de passe 🔐</h2>
    <p>Clique ci-dessous :</p>
    <p>
      <a href="${link}" style="display:inline-block;padding:10px 14px;background:#22d3ee;color:#0b0d10;text-decoration:none;border-radius:8px;font-weight:700">
        Changer mon mot de passe
      </a>
    </p>
    <p>Ou copie-colle ce lien :<br/><code>${link}</code></p>
    <hr style="border:none;border-top:1px solid #ddd;margin:16px 0"/>
    <small>Valable 60 minutes.</small>
  </div>`;
  return { subject, html, link };
}
