import test from "node:test";
import assert from "node:assert/strict";
import {
  getChangedEventFieldLabels,
  hasEventFormChanges,
  hasScheduleChanges,
  type AdminEventForm,
} from "../src/features/admin/eventForm";

const baseForm: AdminEventForm = {
  title: "Турнир",
  description: "Описание",
  start_time: "2026-04-28T10:00",
  end_time: "2026-04-28T18:00",
  timezone: "Europe/Moscow",
  small_reward_percent: "40",
  big_reward_percent: "80",
};

test("detects meaningful event form changes", () => {
  assert.equal(hasEventFormChanges(baseForm, baseForm), false);
  assert.equal(hasEventFormChanges({ ...baseForm, title: " Турнир " }, baseForm), false);
  assert.equal(hasEventFormChanges({ ...baseForm, title: "Весенний турнир" }, baseForm), true);
});

test("returns changed field labels for admin feedback", () => {
  assert.deepEqual(
    getChangedEventFieldLabels({ ...baseForm, description: "Новое", big_reward_percent: "90" }, baseForm),
    ["описание", "процент большого приза"]
  );
});

test("detects schedule-only changes", () => {
  assert.equal(hasScheduleChanges({ ...baseForm, description: "Новое" }, baseForm), false);
  assert.equal(hasScheduleChanges({ ...baseForm, end_time: "2026-04-28T19:00" }, baseForm), true);
  assert.equal(hasScheduleChanges({ ...baseForm, timezone: "UTC" }, baseForm), true);
});
