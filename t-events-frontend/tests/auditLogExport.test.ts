import test from "node:test";
import assert from "node:assert/strict";
import { buildAuditExportQuery, type AuditExportForm } from "../src/features/admin/auditLogExport";

const baseForm: AuditExportForm = {
  actor_user_id: "",
  event_id: "",
  action: "",
  entity_type: "",
  from: "",
  to: "",
  limit: "1000",
  offset: "0",
};

test("builds an audit export query with capped limit and custom string filters", () => {
  const result = buildAuditExportQuery({
    ...baseForm,
    actor_user_id: "12",
    event_id: "34",
    action: "custom.action",
    entity_type: "custom_entity",
    from: "2026-05-10T10:00",
    to: "2026-05-11T12:30",
    limit: "1500",
    offset: "2000",
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.query.actor_user_id, 12);
  assert.equal(result.query.event_id, 34);
  assert.equal(result.query.action, "custom.action");
  assert.equal(result.query.entity_type, "custom_entity");
  assert.equal(result.query.limit, 1000);
  assert.equal(result.query.offset, 2000);
  assert.match(result.query.from ?? "", /^2026-05-10T/);
  assert.match(result.query.to ?? "", /^2026-05-11T/);
});

test("rejects invalid audit export numbers before calling the API", () => {
  const result = buildAuditExportQuery({
    ...baseForm,
    actor_user_id: "0",
    event_id: "-2",
    limit: "1.5",
    offset: "-1",
  });

  assert.equal(result.ok, false);
  if (result.ok) return;

  assert.equal(result.errors.actor_user_id, "Введите целое число больше 0");
  assert.equal(result.errors.event_id, "Введите целое число больше 0");
  assert.equal(result.errors.limit, "Введите целое число больше 0");
  assert.equal(result.errors.offset, "Введите целое число от 0");
});

test("rejects an inverted audit export date range", () => {
  const result = buildAuditExportQuery({
    ...baseForm,
    from: "2026-05-12T10:00",
    to: "2026-05-11T10:00",
  });

  assert.equal(result.ok, false);
  if (result.ok) return;

  assert.equal(result.errors.range, "Дата начала не должна быть позже даты окончания");
});
