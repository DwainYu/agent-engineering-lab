import { createContext, useContext } from "react";
import {
  DEFAULT_LANGUAGE as FALLBACK_LANGUAGE,
  LANGUAGES as SUPPORTED_LANGUAGES,
  LANGUAGE_LABELS,
  LANGUAGE_STORAGE_KEY,
  isLanguage,
  type Language,
} from "../../../scripts/lib/language";

export type { Language };
export { isLanguage };

export const LANGUAGES: Language[] = [...SUPPORTED_LANGUAGES];
export const DEFAULT_LANGUAGE: Language = FALLBACK_LANGUAGE;
export const STORAGE_KEY: string = LANGUAGE_STORAGE_KEY;
export const LANGUAGE_LABEL: Record<Language, string> = LANGUAGE_LABELS;

/** `/en/learn/day/6` → `en`; `/zh` → `zh`; `/learn/day/6` → `undefined`. */
export function languageFromPath(pathname: string): Language | undefined {
  const match = /^\/(en|zh)(?=\/|$)/.exec(pathname);
  const value = match?.[1];
  return value !== undefined && isLanguage(value) ? value : undefined;
}

/**
 * Rewrite a route for another language, keeping the document id intact:
 * `/en/learn/day/6` → `/zh/learn/day/6`. A legacy path with no prefix gets
 * one: `/learn/day/6` → `/en/learn/day/6`.
 */
export function withLanguage(pathname: string, language: Language): string {
  if (languageFromPath(pathname) !== undefined) {
    return pathname.replace(/^\/(en|zh)(?=\/|$)/, `/${language}`);
  }
  const rest = pathname.replace(/\/+$/, "");
  return rest === "" ? `/${language}` : `/${language}${rest}`;
}

/** `/{lang}/{path}` — every internal href carries the language prefix. */
export function langHref(language: Language, path = ""): string {
  const clean = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return clean === "" ? `/${language}` : `/${language}/${clean}`;
}

/** A broken or missing preference must never decide the default: English. */
export function readStoredLanguage(): Language {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value !== null && isLanguage(value) ? value : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function writeStoredLanguage(language: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    /* storage disabled — the URL still decides */
  }
}

export interface LanguageState {
  /** URL first, remembered preference second */
  language: Language;
  /** switch language by navigating; keeps the current document id */
  setLanguage: (language: Language) => void;
  /** same page in another language — for `<Link to>` */
  hrefFor: (language: Language) => string;
  /** remember for unprefixed links, without navigating */
  remember: (language: Language) => void;
}

export const LanguageContext = createContext<LanguageState | null>(null);

export function useLanguage(): LanguageState {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return value;
}

/** The other side of a bilingual pair. */
export function otherLanguage(language: Language): Language {
  return LANGUAGES.find((item) => item !== language) ?? DEFAULT_LANGUAGE;
}
