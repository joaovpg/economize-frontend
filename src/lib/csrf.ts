const CSRF_TOKEN_STORAGE_KEY = "economize_csrf_token";

function getSessionStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.sessionStorage;
}

export function saveCsrfToken(token: string): void {
  getSessionStorage()?.setItem(CSRF_TOKEN_STORAGE_KEY, token);
}

export function getCsrfToken(): string | null {
  return getSessionStorage()?.getItem(CSRF_TOKEN_STORAGE_KEY) ?? null;
}

export function clearCsrfToken(): void {
  getSessionStorage()?.removeItem(CSRF_TOKEN_STORAGE_KEY);
}
