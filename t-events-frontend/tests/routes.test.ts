import test from "node:test";
import assert from "node:assert/strict";
import { routes } from "../src/lib/routes";

test("builds participant event routes", () => {
  assert.equal(routes.events, "/events");
  assert.equal(routes.currentParticipation, "/events/current");
  assert.equal(routes.event(7), "/events/7");
  assert.equal(routes.eventDirections(7), "/events/7/directions");
  assert.equal(routes.eventDirectionGames(7, 3), "/events/7/directions/3/games");
  assert.equal(routes.eventGame(7, 3, 11), "/events/7/directions/3/games/11");
  assert.equal(routes.eventDirectionProgress(7, 3), "/events/7/directions/3/progress");
  assert.equal(routes.eventDirectionReward(7, 3), "/events/7/directions/3/reward");
});

test("builds admin and staff routes", () => {
  assert.equal(routes.adminEvents, "/admin/events");
  assert.equal(routes.adminEvent(9), "/admin/events/9");
  assert.equal(routes.standerScan, "/stander/scan");
  assert.equal(routes.standerInventory, "/stander/inventory");
});
