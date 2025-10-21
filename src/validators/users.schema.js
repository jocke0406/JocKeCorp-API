import Joi from 'joi';

export const DEFAULT_ROLE = 'visiteur';

// Règle commune display_name : trim, max, interdit les emails
const displayNameRule = Joi.string()
  .trim()
  .max(80)
  .allow(null, '') // on accepte vide/null en entrée...
  .custom((v, helpers) => {
    if (!v) return v; // null ou chaîne vide, OK (on normalisera -> null côté contrôleur)
    // Interdit tout ce qui ressemble à un email
    if (/@/.test(v)) return helpers.error('string.noemail');
    return v;
  }, 'reject emails in display_name')
  .messages({
    'string.noemail': 'display_name ne peut pas être une adresse email.',
    'string.max': 'display_name est trop long (max 80 caractères).',
  });

// Payloads
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  display_name: displayNameRule,
  role: Joi.string()
    .valid('MasterOfUnivers', 'superadmin', 'officier', 'agent', 'visiteur')
    .default(DEFAULT_ROLE),
});

export const publicRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  display_name: displayNameRule,
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateSchema = Joi.object({
  display_name: displayNameRule,
  role: Joi.string().valid('MasterOfUnivers', 'superadmin', 'officier', 'agent', 'visiteur'),
}).min(1);

// (optionnel) Validator Mongo
export const USERS_JSON_SCHEMA = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['email', 'password_hash', 'role', 'created_at'],
    properties: {
      _id: { bsonType: 'objectId' },
      email: { bsonType: 'string', pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' },
      password_hash: { bsonType: 'string' },
      role: {
        enum: ['MasterOfUnivers', 'superadmin', 'officier', 'agent', 'visiteur'],
      },
      // Autoriser string ou null en base
      display_name: { bsonType: ['string', 'null'], maxLength: 80 },
      email_verified_at: { bsonType: ['date', 'null'] },
      created_at: { bsonType: 'date' },
      updated_at: { bsonType: 'date' },
    },
    additionalProperties: false,
  },
};
