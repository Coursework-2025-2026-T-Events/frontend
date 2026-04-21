import test from "node:test";
import assert from "node:assert/strict";
import { getErrorMessage } from "../src/lib/getErrorMessage";

test("returns message from Error instance", () => {
  assert.equal(getErrorMessage(new Error("boom"), "fallback"), "boom");
});

test("returns message field from object errors", () => {
  assert.equal(getErrorMessage({ message: "api failed" }, "fallback"), "api failed");
});

test("returns fallback for unknown values", () => {
  assert.equal(getErrorMessage({ message: 123 }, "fallback"), "fallback");
  assert.equal(getErrorMessage(null, "fallback"), "fallback");
});
