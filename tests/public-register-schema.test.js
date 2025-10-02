import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_ROLE,
  publicRegisterSchema,
} from "../src/validators/users.schema.js";

const basePayload = {
  email: "new-user@example.com",
  password: "password123",
  display_name: "New User",
};

test("public registration strips any provided role", () => {
  const { error, value } = publicRegisterSchema.validate(
    { ...basePayload, role: "superadmin" },
    { abortEarly: false, stripUnknown: true }
  );

  assert.ifError(error);
  assert.equal(value.role, undefined);
});

test("default role constant is visiteur", () => {
  assert.equal(DEFAULT_ROLE, "visiteur");
});
