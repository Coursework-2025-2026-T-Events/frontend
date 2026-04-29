import test from "node:test";
import assert from "node:assert/strict";
import {
  auditActionOptions,
  auditEntityTypeOptions,
  getAuditActionLabel,
  getAuditEntityTypeLabel,
  getAuditExportFilename,
} from "../src/features/admin/auditPresentation";

test("returns localized audit action and entity labels", () => {
  assert.equal(getAuditActionLabel("admin.event.publish"), "Публикация мероприятия");
  assert.equal(getAuditActionLabel("custom.action"), "custom.action");
  assert.equal(getAuditEntityTypeLabel("reward_redemption"), "Выдача награды");
  assert.equal(getAuditEntityTypeLabel("custom_entity"), "custom_entity");
});

test("keeps audit option values aligned with API enums", () => {
  assert.equal(auditActionOptions.some((option) => option.value === "reward.redemption.create"), true);
  assert.equal(auditEntityTypeOptions.some((option) => option.value === "event_game"), true);
});

test("builds stable audit export filenames", () => {
  assert.equal(getAuditExportFilename("2", new Date("2026-05-12T10:00:00Z")), "audit-journal-2026-05-12-page-2.csv");
  assert.equal(getAuditExportFilename("", new Date("2026-05-12T10:00:00Z")), "audit-journal-2026-05-12-page-1.csv");
});
