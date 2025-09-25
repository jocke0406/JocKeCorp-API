// src/controllers/auth.controller.js
import { getCollection } from "../db/client.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { loginSchema, registerSchema } from "../validators/users.schema.js";
import {
  forgotSchema,
  resetSchema,
  verifyEmailSchema,
} from "../validators/auth.schema.js";
import { genToken, hashToken } from "../utils/token.js";

const Users = () => getCollection("users");
const Tokens = () => getCollection("tokens");
const now = () => new Date();

/** REGISTER: crée user non vérifié + log lien vérification */
export async function register(req, res) {
  const { error, value } = registerSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error)
    return res
      .status(400)
      .json({ error: "Validation error", details: error.details });

  try {
    const email = String(value.email).trim().toLowerCase();
    await Users().createIndex({ email: 1 }, { unique: true });

    const doc = {
      email,
      password_hash: await hashPassword(value.password),
      role: value.role,
      display_name: value.display_name ?? null,
      email_verified_at: null, // 👈 non vérifié à la création
      created_at: now(),
      updated_at: now(),
    };

    const { insertedId } = await Users().insertOne(doc);

    // Token de vérification (24h)
    const t = genToken(32, 60 * 24);
    await Tokens().insertOne({
      user_id: insertedId,
      purpose: "verify_email",
      token_hash: t.token_hash,
      created_at: t.created_at,
      expires_at: t.expires_at,
      used_at: null,
    });

    // Lien à envoyer par email (pour l'instant on log)
    const link = `http://localhost:3000/auth/verify-email?token=${t.token}`;
    console.log("📧 Email verification link:", email, "=>", link);

    return res.status(201).json({
      _id: insertedId,
      email,
      role: doc.role,
      display_name: doc.display_name,
      message: "Compte créé. Vérifie ton email pour activer le compte.",
    });
  } catch (e) {
    if (e?.code === 11000)
      return res.status(409).json({ error: "Email déjà utilisé" });
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/** VERIFY EMAIL: consomme le token de vérif puis marque l'email vérifié */
export async function verifyEmail(req, res) {
  const { error, value } = verifyEmailSchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) return res.status(400).json({ error: "Invalid token" });

  try {
    const token_hash = hashToken(value.token);
    const tok = await Tokens().findOne({
      token_hash,
      purpose: "verify_email",
      used_at: null,
    });
    if (!tok) return res.status(400).json({ error: "Token invalide" });
    if (tok.expires_at < now())
      return res.status(400).json({ error: "Token expiré" });

    await Users().updateOne(
      { _id: tok.user_id },
      { $set: { email_verified_at: now(), updated_at: now() } }
    );
    await Tokens().updateOne({ _id: tok._id }, { $set: { used_at: now() } });

    return res.json({ message: "Email vérifié. Tu peux te connecter." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/** LOGIN: refuse si email non vérifié */
export async function login(req, res) {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error)
    return res
      .status(400)
      .json({ error: "Validation error", details: error.details });

  try {
    const email = String(value.email).trim().toLowerCase();
    const user = await Users().findOne({
      email,
      deleted_at: { $exists: false },
    });
    if (!user)
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    if (!user.email_verified_at) {
      return res
        .status(403)
        .json({ error: "Email non vérifié. Vérifie ta boîte." });
    }

    const ok = await verifyPassword(user.password_hash, value.password);
    if (!ok)
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    return res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      display_name: user.display_name,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/** FORGOT PASSWORD: génère un token 1h (toujours 200 pour éviter l’énumération) */
export async function forgotPassword(req, res) {
  const { error, value } = forgotSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error)
    return res
      .status(200)
      .json({ message: "Si le compte existe, un email a été envoyé." });

  try {
    const email = String(value.email).trim().toLowerCase();
    const user = await Users().findOne({
      email,
      deleted_at: { $exists: false },
    });

    if (user && user.email_verified_at) {
      const t = genToken(32, 60); // 60 min
      await Tokens().insertOne({
        user_id: user._id,
        purpose: "reset_password",
        token_hash: t.token_hash,
        created_at: t.created_at,
        expires_at: t.expires_at,
        used_at: null,
      });
      const link = `http://localhost:3000/auth/reset-password?token=${t.token}`;
      console.log("🔐 Password reset link:", email, "=>", link);
    }

    return res
      .status(200)
      .json({ message: "Si le compte existe, un email a été envoyé." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/** RESET PASSWORD: consomme le token et remplace le hash */
export async function resetPassword(req, res) {
  const { error, value } = resetSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error)
    return res
      .status(400)
      .json({ error: "Validation error", details: error.details });

  try {
    const token_hash = hashToken(value.token);
    const tok = await Tokens().findOne({
      token_hash,
      purpose: "reset_password",
      used_at: null,
    });
    if (!tok) return res.status(400).json({ error: "Token invalide" });
    if (tok.expires_at < now())
      return res.status(400).json({ error: "Token expiré" });

    const newHash = await hashPassword(value.password);
    await Users().updateOne(
      { _id: tok.user_id },
      { $set: { password_hash: newHash, updated_at: now() } }
    );
    await Tokens().updateOne({ _id: tok._id }, { $set: { used_at: now() } });

    return res.json({
      message: "Mot de passe mis à jour. Tu peux te connecter.",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
