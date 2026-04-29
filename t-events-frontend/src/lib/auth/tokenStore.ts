export const LOGOUT_INTENT_KEY = "t-events-logout-intent";

let memoryToken: string | null = null;

function readLogoutIntent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LOGOUT_INTENT_KEY) === "1";
  } catch {
    return false;
  }
}

export const tokenStore = {
  get: (): string | null => {
    return memoryToken;
  },
  set: (token: string | null) => {
    memoryToken = token;
  },
  hasLogoutIntent: (): boolean => {
    return readLogoutIntent();
  },
  setLogoutIntent: (value: boolean) => {
    if (typeof window === "undefined") return;
    try {
      if (value) {
        localStorage.setItem(LOGOUT_INTENT_KEY, "1");
      } else {
        localStorage.removeItem(LOGOUT_INTENT_KEY);
      }
    } catch {
      // ignore storage failures in restricted browser modes
    }
  },
};
