import test from "node:test";
import assert from "node:assert/strict";
import { buildEventSettingsTabs, getNextEventSettingsTab } from "../src/features/admin/eventSettingsTabs";

test("builds admin event settings tabs with readiness badges", () => {
  const tabs = buildEventSettingsTabs({
    isDraft: true,
    isEventLoaded: true,
    detailsReady: true,
    directionsReady: false,
    gamesReady: true,
    directionCount: 2,
    gameCount: 3,
    publishIssueCount: 1,
  });

  assert.deepEqual(
    tabs.map((tab) => ({ id: tab.id, badge: tab.badge, hasIssue: tab.hasIssue })),
    [
      { id: "details", badge: undefined, hasIssue: false },
      { id: "directions", badge: 2, hasIssue: true },
      { id: "games", badge: 3, hasIssue: false },
      { id: "publish", badge: undefined, hasIssue: true },
    ],
  );
});

test("resolves keyboard navigation for admin event settings tabs", () => {
  const tabs = buildEventSettingsTabs({
    isDraft: false,
    isEventLoaded: true,
    detailsReady: true,
    directionsReady: true,
    gamesReady: true,
    directionCount: 1,
    gameCount: 1,
    publishIssueCount: 0,
  });

  assert.equal(getNextEventSettingsTab(tabs, "details", "ArrowRight"), "directions");
  assert.equal(getNextEventSettingsTab(tabs, "details", "ArrowLeft"), "publish");
  assert.equal(getNextEventSettingsTab(tabs, "games", "Home"), "details");
  assert.equal(getNextEventSettingsTab(tabs, "games", "End"), "publish");
  assert.equal(getNextEventSettingsTab(tabs, "games", "Escape"), null);
});
