import { transporter } from './src/utils/mailer.js';

console.log("Vérification de la connexion SMTP...");
transporter
  .verify()
  .then(() => console.log("✅ SMTP OK — connexion réussie"))
  .catch(err => {
    console.error("❌ Erreur SMTP :", err);
    process.exit(1);
  });