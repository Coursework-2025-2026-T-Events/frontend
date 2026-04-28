import test from "node:test";
import assert from "node:assert/strict";
import { api } from "../src/lib/api/client";
import { tokenStore } from "../src/lib/auth/tokenStore";

test("coalesces concurrent refreshes after 401 responses", async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; authorization: string | null }> = [];
  let refreshCalls = 0;
  let protectedCalls = 0;

  tokenStore.set("old-token");

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const headers = new Headers(init?.headers);
    calls.push({ url, authorization: headers.get("Authorization") });

    if (url === "/api/v1/auth/refresh") {
      refreshCalls += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return new Response(JSON.stringify({ data: { access_token: "new-token" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    protectedCalls += 1;
    if (headers.get("Authorization") === "Bearer old-token") {
      return new Response(JSON.stringify({ error: { code: "unauthorized", message: "expired" } }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: { ok: true } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const [first, second] = await Promise.all([
      api.get<{ data: { ok: boolean } }>("/protected"),
      api.get<{ data: { ok: boolean } }>("/protected"),
    ]);

    assert.equal(first.data.ok, true);
    assert.equal(second.data.ok, true);
    assert.equal(refreshCalls, 1);
    assert.equal(protectedCalls, 4);
    assert.equal(tokenStore.get(), "new-token");
    assert.equal(calls.filter((call) => call.authorization === "Bearer new-token").length, 2);
  } finally {
    tokenStore.set(null);
    globalThis.fetch = originalFetch;
  }
});
