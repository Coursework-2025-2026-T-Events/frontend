import test from "node:test";
import assert from "node:assert/strict";
import { toComparableDateTime, toLocalDateTimeValueInZone, toRfc3339 } from "../src/features/admin/eventDateTime";

test("formats admin event timestamps in the selected timezone", () => {
  assert.equal(toLocalDateTimeValueInZone("2026-05-12T09:30:00Z", "Europe/Moscow"), "12.05.2026 12:30");
});

test("serializes local admin event datetime to RFC3339 with timezone offset", () => {
  assert.equal(toRfc3339("12.05.2026 12:30", "Europe/Moscow"), "2026-05-12T12:30:00+03:00");
});

test("keeps invalid comparable datetime values unchanged for field-level validation", () => {
  assert.equal(toComparableDateTime("bad date", "Europe/Moscow"), "bad date");
});
