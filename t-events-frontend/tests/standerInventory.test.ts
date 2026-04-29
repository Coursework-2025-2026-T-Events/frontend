import test from "node:test";
import assert from "node:assert/strict";
import {
  formatInventoryDateTime,
  getInventoryDirectionId,
  getInventoryEventId,
  getInventoryRewardCounts,
  getInventoryRewardTypeLabel,
  getInventoryVisibleRange,
  hasNextInventoryPage,
  hasPreviousInventoryPage,
  initialStanderInventoryFilters,
  toInventoryRequestFilters,
  validateStanderInventoryFilters,
} from "../src/features/reward/standerInventory";
import type { RedemptionListEntryDTO, RedemptionListPageDTO } from "../src/lib/api/types";

function entry(overrides: Partial<RedemptionListEntryDTO>): RedemptionListEntryDTO {
  return {
    redemption_id: "r-1",
    event_id: 1,
    direction_id: 2,
    direction_name: "Direction",
    user_id: 3,
    full_name: "User",
    email: "user@example.com",
    reward_type: "small",
    redeemed_at: "2026-05-12T12:00:00Z",
    stander_user_id: 4,
    stander_full_name: "Stander",
    ...overrides,
  };
}

function page(overrides: Partial<RedemptionListPageDTO>): RedemptionListPageDTO {
  return {
    event_id: 1,
    total: 45,
    limit: 20,
    offset: 0,
    items: [],
    ...overrides,
  };
}

test("builds stander inventory labels and date presentation", () => {
  assert.equal(getInventoryRewardTypeLabel("small"), "Малый");
  assert.equal(getInventoryRewardTypeLabel("big"), "Большой");
  assert.match(formatInventoryDateTime("2026-05-12T12:00:00Z"), /2026/);
});

test("derives inventory filters for API requests", () => {
  assert.equal(getInventoryEventId({ ...initialStanderInventoryFilters, eventId: "42" }), 42);
  assert.equal(getInventoryEventId({ ...initialStanderInventoryFilters, eventId: "0" }), null);
  assert.equal(getInventoryDirectionId({ ...initialStanderInventoryFilters, directionId: "7" }), 7);
  assert.equal(getInventoryDirectionId({ ...initialStanderInventoryFilters, directionId: "" }), undefined);
  assert.deepEqual(
    toInventoryRequestFilters({
      eventId: "42",
      q: "  Alice  ",
      directionId: "7",
      rewardType: "big",
    }),
    {
      q: "Alice",
      direction_id: 7,
      reward_type: "big",
    },
  );
});

test("validates required inventory event filter", () => {
  assert.deepEqual(validateStanderInventoryFilters(initialStanderInventoryFilters), {
    eventId: "Выберите мероприятие",
  });
  assert.deepEqual(validateStanderInventoryFilters({ ...initialStanderInventoryFilters, eventId: "42" }), {});
});

test("calculates inventory counts and pagination", () => {
  assert.deepEqual(getInventoryRewardCounts([entry({ reward_type: "small" }), entry({ reward_type: "big" })]), {
    small: 1,
    big: 1,
  });
  assert.equal(hasPreviousInventoryPage(20), true);
  assert.equal(hasPreviousInventoryPage(0), false);
  assert.equal(hasNextInventoryPage(page({ offset: 20 })), true);
  assert.equal(hasNextInventoryPage(page({ offset: 40 })), false);
  assert.deepEqual(getInventoryVisibleRange(page({ offset: 20 })), {
    from: 21,
    to: 40,
    total: 45,
  });
  assert.deepEqual(getInventoryVisibleRange(page({ total: 0 })), {
    from: 0,
    to: 0,
    total: 0,
  });
});
