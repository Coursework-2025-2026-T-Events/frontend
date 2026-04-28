import test from "node:test";
import assert from "node:assert/strict";
import { buildRedemptionQrPayload, extractSignedToken } from "../src/lib/qrToken";

test("extracts a raw signed token", () => {
  assert.equal(extractSignedToken("  signed.token.value  "), "signed.token.value");
});

test("extracts token query params from absolute and relative QR URLs", () => {
  assert.equal(extractSignedToken("https://example.com/stander/scan?token=abc123"), "abc123");
  assert.equal(extractSignedToken("/stander/scan?signed_token=xyz789"), "xyz789");
});

test("does not treat a scan URL without token as a raw token", () => {
  assert.equal(extractSignedToken("http://localhost:3000/stander/scan"), "");
  assert.equal(extractSignedToken("/stander/scan"), "");
});

test("builds a stander scan URL when origin is available", () => {
  assert.equal(
    buildRedemptionQrPayload("abc 123", "https://events.example.com"),
    "https://events.example.com/stander/scan?token=abc+123"
  );
});

test("falls back to raw token without origin", () => {
  assert.equal(buildRedemptionQrPayload("abc123"), "abc123");
});
