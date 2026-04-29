import test from "node:test";
import assert from "node:assert/strict";
import {
  adminEventStatusMeta,
  filterAdminEvents,
  getAdminEventsSummary,
  getAdminEventWindow,
  getReadyAdminEventsCount,
  sortAdminEvents,
} from "../src/features/admin/adminEventsPresentation";
import type { AdminEventDTO } from "../src/lib/api/types";

function event(overrides: Partial<AdminEventDTO>): AdminEventDTO {
  return {
    event_id: 1,
    title: "Event",
    description: "",
    status: "draft",
    start_time: null,
    end_time: null,
    timezone: null,
    small_reward_percent: null,
    big_reward_percent: null,
    direction_count: 0,
    game_count: 0,
    created_at: "2026-05-10T10:00:00Z",
    updated_at: "2026-05-10T10:00:00Z",
    published_at: null,
    archived_at: null,
    created_by_user_id: null,
    updated_by_user_id: null,
    ...overrides,
  };
}

test("formats admin event status and empty schedule", () => {
  assert.equal(adminEventStatusMeta.draft.label, "Черновик");
  assert.equal(getAdminEventWindow(event({})), "Расписание не задано");
});

test("sorts admin events by latest activity first", () => {
  const older = event({ event_id: 1, updated_at: "2026-05-10T10:00:00Z" });
  const newer = event({ event_id: 2, updated_at: "2026-05-12T10:00:00Z" });

  assert.deepEqual(sortAdminEvents([older, newer]).map((item) => item.event_id), [2, 1]);
});

test("counts admin events ready for publication checks", () => {
  assert.equal(
    getReadyAdminEventsCount([
      event({ direction_count: 1, game_count: 1 }),
      event({ direction_count: 1, game_count: 0 }),
    ]),
    1,
  );
});

test("filters admin events by search text and status", () => {
  const draft = event({ event_id: 12, title: "Весенний день", description: "Школа", status: "draft" });
  const active = event({ event_id: 25, title: "Осенний турнир", description: "Университет", status: "active" });

  assert.deepEqual(filterAdminEvents([draft, active], "школа", "draft").map((item) => item.event_id), [12]);
  assert.deepEqual(filterAdminEvents([draft, active], "25", "all").map((item) => item.event_id), [25]);
});

test("builds admin events dashboard summary", () => {
  assert.deepEqual(
    getAdminEventsSummary([
      event({ status: "active", direction_count: 1, game_count: 1 }),
      event({ status: "draft", direction_count: 1, game_count: 0 }),
      event({ status: "draft", direction_count: 2, game_count: 2 }),
    ]),
    {
      totalEvents: 3,
      activeEvents: 1,
      draftEvents: 2,
      readyEvents: 2,
    },
  );
});

