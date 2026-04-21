import test from "node:test";
import assert from "node:assert/strict";
import { isRoleAllowed } from "../src/features/auth/authorization";

test("allows any role when allowedRoles is not provided", () => {
  assert.equal(isRoleAllowed("participant", undefined), true);
});

test("allows only configured roles", () => {
  assert.equal(isRoleAllowed("stander", ["stander", "admin"]), true);
  assert.equal(isRoleAllowed("participant", ["stander", "admin"]), false);
});
