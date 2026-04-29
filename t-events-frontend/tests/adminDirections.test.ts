import test from "node:test";
import assert from "node:assert/strict";
import { getAvailableDirections } from "../src/features/admin/directions";
import type { AdminEventDirectionDTO, DirectionDTO } from "../src/lib/api/types";

const directions: DirectionDTO[] = [
  { direction_id: 1, name: "Backend" },
  { direction_id: 2, name: "Frontend" },
  { direction_id: 3, name: "Design" },
];

const eventDirections: AdminEventDirectionDTO[] = [
  {
    direction_id: 2,
    name: "Frontend",
    event_id: 10,
    game_count: 2,
  },
];

test("returns only directions not attached to the admin event", () => {
  assert.deepEqual(getAvailableDirections(directions, eventDirections), [
    { direction_id: 1, name: "Backend" },
    { direction_id: 3, name: "Design" },
  ]);
});

test("returns an empty list when direction catalog is not loaded", () => {
  assert.deepEqual(getAvailableDirections(undefined, eventDirections), []);
});
