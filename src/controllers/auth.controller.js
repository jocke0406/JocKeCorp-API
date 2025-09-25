import { getCollection } from "../db/client.js";
import { verifyPassword } from "../utils/password.js";
import { loginSchema, registerSchema } from "../validators/users.schema.js";
import { hashPassword } from "../utils/password.js";

const Users = () => getCollection("users");
const now = () => new Date();

// Option 1: /auth/register (alias de POST /users)
export async function register(req, res) {
  const { error, value } = registerSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error)
    return res
      .status(400)
      .json({ error: "Validation error", details: error.details });
  try {
    const doc = {
      email: value.email.toLowerCase(),
      password_hash: await hashPassword(value.password),
      role: value.role,
      display_name: value.display_name ?? null,
      created_at: now(),
      updated_at: now(),
    };
    await Users().createIndex({ email: 1 }, { unique: true });
    const r = await Users().insertOne(doc);
    return res.status(201).json({
      _id: r.insertedId,
      email: doc.email,
      role: doc.role,
      display_name: doc.display_name,
    });
  } catch (e) {
    if (e?.code === 11000)
      return res.status(409).json({ error: "Email déjà utilisé" });
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// /auth/login — vérifie le hash (pas de JWT pour l’instant)
export async function login(req, res) {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error)
    return res
      .status(400)
      .json({ error: "Validation error", details: error.details });
  try {
    const user = await Users().findOne({
      email: value.email.toLowerCase(),
      deleted_at: { $exists: false },
    });
    if (!user)
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });

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
