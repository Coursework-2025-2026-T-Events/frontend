const TOKEN_KEY = "t-events-access-token";
let accessToken: string | null = null;

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function persistToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore storage failures in restricted browser modes
  }
}

export const tokenStore = {
  get: () => {
    if (accessToken !== null) return accessToken;
    accessToken = readStoredToken();
    return accessToken;
  },
  set: (token: string | null) => {
    accessToken = token;
    persistToken(token);
  },
};
