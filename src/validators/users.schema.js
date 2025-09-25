import Joi from "joi";

// Payloads
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  display_name: Joi.string().allow("", null),
  role: Joi.string()
    .valid("MasterOfUnivers", "superadmin", "officier", "agent", "visiteur")
    .default("visiteur"),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateSchema = Joi.object({
  display_name: Joi.string().allow("", null),
  role: Joi.string().valid(
    "MasterOfUnivers",
    "superadmin",
    "officier",
    "agent",
    "visiteur"
  ),
}).min(1); // au moins un champ

// Validator Mongo (strict) — optionnel mais recommandé (à appliquer plus tard si tu veux)
export const USERS_JSON_SCHEMA = {
  $jsonSchema: {
    bsonType: "object",
    required: ["email", "password_hash", "role", "created_at"],
    properties: {
      _id: { bsonType: "objectId" },
      email: { bsonType: "string", pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" },
      password_hash: { bsonType: "string" },
      role: {
        enum: [
          "MasterOfUnivers",
          "superadmin",
          "officier",
          "agent",
          "visiteur",
        ],
      },
      display_name: { bsonType: "string" },
      created_at: { bsonType: "date" },
      updated_at: { bsonType: "date" },
    },
    additionalProperties: false,
  },
};
