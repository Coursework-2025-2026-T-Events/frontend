import test from "node:test";
import assert from "node:assert/strict";
import { deriveAuthStatus, isAuthEvent, serializeAuthEvent } from "../src/features/auth/authSession";
import type { UserDTO } from "../src/lib/api/types";

const user: UserDTO = {
  user_id: 1,
  full_name: "User",
  email: "user@example.com",
  role: "participant",
};

test("derives explicit auth lifecycle statuses", () => {
  assert.equal(
    deriveAuthStatus({
      user: null,
      isBootstrapping: false,
      isLogoutInProgress: false,
      hasBootstrapped: false,
      sessionExpired: false,
    }),
    "unknown",
  );
  assert.equal(
    deriveAuthStatus({
      user: null,
      isBootstrapping: true,
      isLogoutInProgress: false,
      hasBootstrapped: false,
      sessionExpired: false,
    }),
    "refreshing",
  );
  assert.equal(
    deriveAuthStatus({
      user,
      isBootstrapping: false,
      isLogoutInProgress: false,
      hasBootstrapped: true,
      sessionExpired: false,
    }),
    "authenticated",
  );
  assert.equal(
    deriveAuthStatus({
      user: null,
      isBootstrapping: false,
      isLogoutInProgress: false,
      hasBootstrapped: true,
      sessionExpired: true,
    }),
    "expired",
  );
  assert.equal(
    deriveAuthStatus({
      user,
      isBootstrapping: false,
      isLogoutInProgress: true,
      hasBootstrapped: true,
      sessionExpired: false,
    }),
    "logout_in_progress",
  );
});

test("serializes and validates cross-tab auth events", () => {
  const event = JSON.parse(serializeAuthEvent("login")) as unknown;

  assert.equal(isAuthEvent(event), true);
  assert.equal(isAuthEvent({ type: "login" }), false);
  assert.equal(isAuthEvent({ type: "refresh", timestamp: Date.now() }), false);
  assert.equal(isAuthEvent(null), false);
});
