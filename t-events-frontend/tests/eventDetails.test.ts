import test from "node:test";
import assert from "node:assert/strict";
import { formatEventDate, formatEventPeriod, getEventStatusLabel } from "../src/features/events/eventDetails";
import type { EventDTO } from "../src/lib/api/types";

function event(overrides: Partial<EventDTO>): EventDTO {
  return {
    event_id: 1,
    title: "Event",
    description: "",
    status: "active",
    start_time: null,
    end_time: null,
    ...overrides,
  };
}

test("formats event status labels", () => {
  assert.equal(getEventStatusLabel("draft"), "черновик");
  assert.equal(getEventStatusLabel("published"), "опубликовано");
  assert.equal(getEventStatusLabel("active"), "активно");
  assert.equal(getEventStatusLabel("finished"), "завершено");
  assert.equal(getEventStatusLabel("archived"), "архив");
});

test("formats event date and period fallbacks", () => {
  assert.equal(formatEventDate(null), "не указано");
  assert.match(formatEventDate("2026-05-12T12:00:00Z"), /2026/);
  assert.equal(formatEventPeriod(event({})), "не указано - не указано");
});
