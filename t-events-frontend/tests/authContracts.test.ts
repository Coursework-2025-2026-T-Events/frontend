import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../src/lib/api/client";
import { parseLoginResponse, parseRegisterResponse, parseUserResponse } from "../src/features/auth/authContracts";

const user = {
  user_id: 1,
  email: "user@example.com",
  full_name: "User Name",
  role: "participant",
};

test("parses valid auth API responses", () => {
  const login = parseLoginResponse({ data: { access_token: "token", user } });
  const register = parseRegisterResponse({ data: { access_token: "token", user } });
  const me = parseUserResponse({ data: user });

  assert.equal(login.data.access_token, "token");
  assert.equal(register.data.user.email, "user@example.com");
  assert.equal(me.data.role, "participant");
});

test("rejects auth API contract mismatches", () => {
  assert.throws(
    () => parseLoginResponse({ data: { access_token: "", user } }),
    (error) => error instanceof ApiError && error.kind === "contract" && error.code === "contract_mismatch",
  );
  assert.throws(
    () => parseUserResponse({ data: { ...user, role: "owner" } }),
    (error) => error instanceof ApiError && error.kind === "contract" && error.code === "contract_mismatch",
  );
});
