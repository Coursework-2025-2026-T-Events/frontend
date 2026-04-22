import test from "node:test";
import assert from "node:assert/strict";
import { getErrorMessage } from "../src/lib/getErrorMessage";
import { ApiError } from "../src/lib/api/client";

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

test("returns human-readable message for known API error codes", () => {
  assert.equal(
    getErrorMessage(new ApiError("raw backend message", 400, "invalid_answer_payload"), "fallback"),
    "Ответ отправлен в неверном формате."
  );
});

test("returns original API error message for unknown API error codes", () => {
  assert.equal(getErrorMessage(new ApiError("backend says no", 400, "unknown_code"), "fallback"), "backend says no");
});
