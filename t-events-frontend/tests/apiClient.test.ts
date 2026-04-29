import test from "node:test";
import assert from "node:assert/strict";
import { ApiError, api } from "../src/lib/api/client";
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

test("classifies network failures as retryable API errors", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () => {
    throw new TypeError("Failed to fetch");
  }) as typeof fetch;

  try {
    await assert.rejects(
      () => api.get("/protected"),
      (error) => {
        assert.equal(error instanceof ApiError, true);
        assert.equal((error as ApiError).kind, "network");
        assert.equal((error as ApiError).code, "network_error");
        assert.equal((error as ApiError).status, 0);
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("classifies invalid successful JSON as a contract mismatch", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () =>
    new Response("{invalid-json", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;

  try {
    await assert.rejects(
      () => api.get("/protected"),
      (error) => {
        assert.equal(error instanceof ApiError, true);
        assert.equal((error as ApiError).kind, "contract");
        assert.equal((error as ApiError).code, "contract_mismatch");
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("classifies malformed refresh responses as contract mismatches", async () => {
  const originalFetch = globalThis.fetch;
  tokenStore.set("old-token");

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const headers = new Headers(init?.headers);

    if (url === "/api/v1/auth/refresh") {
      return new Response(JSON.stringify({ data: { token: "wrong-field" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

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
    await assert.rejects(
      () => api.get("/protected"),
      (error) => {
        assert.equal(error instanceof ApiError, true);
        assert.equal((error as ApiError).kind, "contract");
        assert.equal((error as ApiError).code, "contract_mismatch");
        return true;
      },
    );
  } finally {
    tokenStore.set(null);
    globalThis.fetch = originalFetch;
  }
});
