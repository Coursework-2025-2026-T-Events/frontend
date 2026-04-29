import test from "node:test";
import assert from "node:assert/strict";
import { adminApi } from "../src/features/admin/api";
import { tokenStore } from "../src/lib/auth/tokenStore";

test("exports admin audit logs as raw CSV with serialized filters", async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; authorization: string | null }> = [];

  tokenStore.set("admin-token");

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    calls.push({ url: String(input), authorization: headers.get("Authorization") });

    return new Response("audit_log_id,created_at\n1,2026-05-11T00:00:00Z\n", {
      status: 200,
      headers: { "Content-Type": "text/csv; charset=utf-8" },
    });
  }) as typeof fetch;

  try {
    const csv = await adminApi.exportAuditLogsCsv({
      actor_user_id: 12,
      event_id: 34,
      action: "admin.event.update",
      entity_type: "event",
      from: "2026-05-01T00:00:00Z",
      to: "2026-05-11T23:59:59Z",
      limit: 1000,
      offset: 2000,
    });

    assert.equal(csv, "audit_log_id,created_at\n1,2026-05-11T00:00:00Z\n");
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.authorization, "Bearer admin-token");
    assert.equal(
      calls[0]?.url,
      "/api/v1/admin/audit-logs/export.csv?actor_user_id=12&event_id=34&action=admin.event.update&entity_type=event&from=2026-05-01T00%3A00%3A00Z&to=2026-05-11T23%3A59%3A59Z&limit=1000&offset=2000"
    );
  } finally {
    tokenStore.set(null);
    globalThis.fetch = originalFetch;
  }
});
