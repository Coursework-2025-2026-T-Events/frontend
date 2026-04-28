const TOKEN_QUERY_KEYS = ["token", "signed_token", "qr", "payload"];

export function extractSignedToken(input: string): string {
  const value = input.trim();
  if (!value) return "";

  for (const candidate of getUrlCandidates(value)) {
    try {
      const url = new URL(candidate);
      for (const key of TOKEN_QUERY_KEYS) {
        const token = url.searchParams.get(key);
        if (token?.trim()) return token.trim();
      }
      return "";
    } catch {
      // Not a URL candidate; keep treating the input as a raw token.
    }
  }

  return value;
}

export function buildRedemptionQrPayload(signedToken: string, origin?: string): string {
  const token = signedToken.trim();
  if (!origin || !token) return token;

  try {
    const url = new URL("/stander/scan", origin);
    url.searchParams.set("token", token);
    return url.toString();
  } catch {
    return token;
  }
}

function getUrlCandidates(value: string): string[] {
  if (/^https?:\/\//i.test(value)) return [value];
  if (value.startsWith("/")) return [`http://local${value}`];
  return [];
}
