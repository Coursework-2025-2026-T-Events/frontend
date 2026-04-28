import test from "node:test";
import assert from "node:assert/strict";
import { buildLoginPath, getSafeRedirectPath } from "../src/lib/auth/redirect";

test("accepts only same-origin app paths as auth redirects", () => {
  assert.equal(getSafeRedirectPath("/events/1/directions/2/games"), "/events/1/directions/2/games");
  assert.equal(getSafeRedirectPath("https://example.com/events"), "/events");
  assert.equal(getSafeRedirectPath("//example.com/events"), "/events");
  assert.equal(getSafeRedirectPath(null), "/events");
});

test("does not redirect back into auth screens", () => {
  assert.equal(getSafeRedirectPath("/auth/login?next=/events"), "/events");
  assert.equal(getSafeRedirectPath("/auth/register"), "/events");
});

test("builds login URL with encoded next path", () => {
  assert.equal(
    buildLoginPath("/events/1/directions/2/games?x=1"),
    "/auth/login?next=%2Fevents%2F1%2Fdirections%2F2%2Fgames%3Fx%3D1"
  );
});
