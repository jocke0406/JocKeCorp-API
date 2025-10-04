import nodemailer from "nodemailer";
import 'dotenv/config';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
} = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
  console.warn("[mailer] SMTP/MAIL_FROM incomplets. Renseigne .env");
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: false,            // STARTTLS -> false sur 587
  requireTLS: true,         // force l’upgrade TLS
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  tls: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true, // garde true en prod
  },
});

/** Envoi générique */
export async function sendMail({ to, subject, html, text, replyTo }) {
  if (!SMTP_HOST) {
    console.log("✉️ [DEV] Email simulé:", { to, subject });
    return { simulated: true };
  }
  return transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]+>/g, " "),
    replyTo, // optionnel
  });
}

/** Templates */
export function renderVerifyEmail({ appBaseUrl, token }) {
  const link = `${appBaseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;
  const subject = "Confirme ton email — JocKeCorp";
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

export function renderResetPassword({ appBaseUrl, token }) {
  const link = `${appBaseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
  const subject = "Réinitialisation de mot de passe — JocKeCorp";
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
export { transporter };
