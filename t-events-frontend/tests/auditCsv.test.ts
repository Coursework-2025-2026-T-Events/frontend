import test from "node:test";
import assert from "node:assert/strict";
import { countCsvDataRows, parsePreviewRows, parseCsvRows } from "../src/features/admin/auditCsv";

test("parses quoted audit csv cells with commas and new lines", () => {
  const csv = [
    "audit_log_id,created_at,actor_full_name,action,entity_type,entity_id,event_id,metadata",
    "1,2026-05-11T00:00:00Z,\"Admin, Main\",admin.event.update,event,42,7,\"{\"\"note\"\":\"\"line 1",
    "line 2\"\"}\"",
  ].join("\n");

  const rows = parseCsvRows(csv);

  assert.equal(rows.length, 2);
  assert.equal(rows[1]?.[2], "Admin, Main");
  assert.equal(rows[1]?.[7], "{\"note\":\"line 1\nline 2\"}");
  assert.equal(countCsvDataRows(csv), 1);
});

test("maps audit csv preview rows by header names", () => {
  const csv = [
    "audit_log_id,created_at,actor_user_id,actor_full_name,action,entity_type,entity_id,event_id,metadata",
    "12,2026-05-11T00:00:00Z,4,Admin User,reward.redemption.create,reward_redemption,99,55,{}",
  ].join("\n");

  assert.deepEqual(parsePreviewRows(csv), [
    {
      audit_log_id: "12",
      created_at: "2026-05-11T00:00:00Z",
      actor_full_name: "Admin User",
      action: "reward.redemption.create",
      entity_type: "reward_redemption",
      entity_id: "99",
      event_id: "55",
    },
  ]);
});
