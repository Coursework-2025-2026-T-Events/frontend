import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../src/lib/api/client";
import {
  getEffectivePublishIssues,
  getPublishValidationDetails,
  groupPublishIssuesBySection,
  toPublishReadinessIssues,
} from "../src/features/admin/eventPublish";

test("extracts publish validation details from API errors", () => {
  const error = new ApiError("Validation failed", 400, "invalid_request", [
    { code: "missing_title", field: "title", message: "Title is required" },
    { code: 123, message: "Invalid item" },
    { code: "missing_game", message: "Game is required" },
  ]);

  assert.deepEqual(getPublishValidationDetails(error), [
    { code: "missing_title", field: "title", message: "Title is required" },
    { code: "missing_game", message: "Game is required" },
  ]);
  assert.deepEqual(getPublishValidationDetails(new Error("No details")), []);
});

test("maps publish validation details to readiness issues", () => {
  assert.deepEqual(
    toPublishReadinessIssues([{ code: "stale_form", field: "event", message: "Save changes" }]),
    [{ code: "stale_form", field: "event", message: "Save changes", section: "publish" }],
  );
});

test("prefers backend readiness issues over publish validation fallback", () => {
  const readinessIssues = [{ code: "missing_direction", message: "Missing direction", section: "directions" as const }];
  const validationDetails = [{ code: "stale_form", message: "Save changes" }];

  assert.equal(getEffectivePublishIssues(readinessIssues, validationDetails), readinessIssues);
  assert.deepEqual(getEffectivePublishIssues([], validationDetails), [
    { code: "stale_form", message: "Save changes", section: "publish", field: undefined },
  ]);
});

test("groups publish issues by settings section", () => {
  const groups = groupPublishIssuesBySection([
    { code: "missing_title", field: "title", message: "Missing title", section: "details" },
    { code: "missing_game", message: "Missing game", section: "games" },
    { code: "stale_form", message: "Save changes", section: "publish" },
  ]);

  assert.equal(groups.details.length, 1);
  assert.equal(groups.directions.length, 0);
  assert.equal(groups.games.length, 1);
  assert.equal(groups.publish.length, 1);
});
