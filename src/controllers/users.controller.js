import { ObjectId } from 'mongodb';
import { getCollection } from '../db/client.js';
import { hashPassword } from '../utils/password.js';
import { registerSchema, updateSchema } from '../validators/users.schema.js';

const Users = () => getCollection('users');
const oid = (id) => ObjectId.createFromHexString(id);
const now = () => new Date();

// CREATE (register-like) — POST /users
export async function createUser(req, res) {
  try {
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({ error: 'Validation error', details: error.details });
    }

    const email = String(value.email).trim().toLowerCase();
    const rawDisplay = (value.display_name ?? '').trim();

    const doc = {
      email,
      password_hash: await hashPassword(value.password),
      role: value.role, // registerSchema fournit "visiteur" par défaut
      display_name: rawDisplay || null,
      created_at: now(),
      updated_at: now(),
    };

    const r = await Users().insertOne(doc);

    return res.status(201).json({
      _id: r.insertedId,
      email: doc.email,
      role: doc.role,
      display_name: doc.display_name,
      created_at: doc.created_at,
    });
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ error: 'Email déjà utilisé' });
    console.error('[createUser] ERROR:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// LIST — GET /users
export async function listUsers(_req, res) {
  try {
    const arr = await Users()
      .find({ deleted_at: { $exists: false } }, { projection: { password_hash: 0 } })
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();
    res.json(arr);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// READ — GET /users/:id
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

    const user = await Users().findOne(
      { _id: oid(id), deleted_at: { $exists: false } },
      { projection: { password_hash: 0 } }
    );
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// UPDATE — PATCH /users/:id
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    // Valide et nettoie le payload
    const { error, value } = updateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({ error: 'Validation error', details: error.details });
    }

    // ⚙️ Normalisation display_name : "" -> null (et trim)
    const patch = { ...value };
    if (Object.prototype.hasOwnProperty.call(patch, 'display_name')) {
      const dn = (patch.display_name ?? '').trim();
      patch.display_name = dn || null;
    }

    const r = await Users().findOneAndUpdate(
      { _id: oid(id), deleted_at: { $exists: false } },
      { $set: { ...patch, updated_at: now() } },
      {
        returnDocument: 'after',
        projection: { password_hash: 0 },
        includeResultMetadata: true, // permet d'avoir lastErrorObject
      }
    );

    // Pas trouvé
    if (!r?.value || r?.lastErrorObject?.updatedExisting === false) {
      return res.status(404).json({ error: 'Utilisateur introuvable', id });
    }

    // OK : document à jour
    return res.json(r.value);
  } catch (e) {
    console.error('[updateUser] ERROR:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE — DELETE /users/:id
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

    const r = await Users().updateOne(
      { _id: oid(id), deleted_at: { $exists: false } },
      { $set: { deleted_at: now(), updated_at: now() } }
    );

    if (!r.matchedCount) return res.status(404).json({ error: 'Utilisateur introuvable', id });
    if (!r.modifiedCount) return res.status(200).json({ message: 'User already deleted', id });

    return res.status(200).json({ message: 'User deleted', id });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
