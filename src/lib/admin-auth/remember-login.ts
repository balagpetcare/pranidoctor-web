const STORAGE_KEY = "prani_admin_remember_identifier";

/** Persists login identifier (email/phone) only — never password or tokens. */
export function saveRememberedIdentifier(identifier: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, identifier.trim());
  } catch {
    /* private browsing / quota */
  }
}

export function clearRememberedIdentifier(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function loadRememberedIdentifier(): string | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)?.trim();
    return v || null;
  } catch {
    return null;
  }
}

export function hasRememberedIdentifier(): boolean {
  return loadRememberedIdentifier() != null;
}
