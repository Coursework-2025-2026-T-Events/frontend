import test from "node:test";
import assert from "node:assert/strict";
import {
  formatParticipationTimestamp,
  hasParticipationSelection,
  mergeParticipationMeta,
} from "../src/features/participation/model";

test("detects complete participation selections", () => {
  assert.equal(hasParticipationSelection({ eventId: 1, directionId: 2 }), true);
  assert.equal(hasParticipationSelection({ eventId: 1, directionId: null }), false);
  assert.equal(hasParticipationSelection({ eventId: null, directionId: 2 }), false);
});

test("merges participation metadata without dropping existing labels", () => {
  assert.deepEqual(
    mergeParticipationMeta({ eventTitle: "Весенний турнир", directionName: "Квиз" }, { directionName: "Игры" }),
    { eventTitle: "Весенний турнир", directionName: "Игры" }
  );
});

test("formats participation timestamps for display", () => {
  assert.equal(formatParticipationTimestamp(null), null);
  assert.equal(formatParticipationTimestamp("not a date"), null);
  assert.match(formatParticipationTimestamp("2026-04-28T10:30:00.000Z") ?? "", /2026/);
});
