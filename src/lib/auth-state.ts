const TOKEN_KEY = "hb_token";
const ROLE_KEY  = "hb_role";
const UID_KEY   = "hb_uid";

/** True only when running in a browser — guards all localStorage access from SSR. */
const isBrowser = typeof window !== "undefined";

export function setAuth(token: string, role: string, userId: number) {
  if (!isBrowser) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(UID_KEY, String(userId));
}

export function clearAuth() {
  if (!isBrowser) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(UID_KEY);
}

export function getToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(ROLE_KEY);
}

export function getUserId(): number | null {
  if (!isBrowser) return null;
  const v = localStorage.getItem(UID_KEY);
  return v ? Number(v) : null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}