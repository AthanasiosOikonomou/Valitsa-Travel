/** Must stay aligned with reads in `LanguageProvider`. */
export const LANGUAGE_STORAGE_KEY = "valitsa-lang";

type PersistedLang = "en" | "gr";

function isPersistedLang(value: string): value is PersistedLang {
  return value === "en" || value === "gr";
}

export function readStoredLang(): PersistedLang | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (raw == null || !isPersistedLang(raw)) return null;
    return raw;
  } catch {
    return null;
  }
}

export function writeStoredLang(lang: PersistedLang): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // ignore quota / private mode
  }
}
