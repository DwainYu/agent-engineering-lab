import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { LanguageState } from "../../lib/language";
import {
  LanguageContext,
  languageFromPath,
  readStoredLanguage,
  withLanguage,
  writeStoredLanguage,
  type Language,
} from "../../lib/language";

/**
 * Mounted once by `Layout`.
 *
 * The route owns the language: `/zh/…` always wins. There is deliberately no
 * `useState` here — the URL is derived on every render, so following a link,
 * pasting an address or opening a tab in a new window all agree without a
 * synchronising effect. The remembered preference exists only as the fallback
 * for a request that carries no prefix, and is read from storage at that
 * moment rather than cached.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const language = languageFromPath(location.pathname) ?? readStoredLanguage();

  /**
   * Switching keeps the document the reader is on and swaps only the prefix,
   * so `setLanguage` is a navigation, not a local mode flag. Storage is written
   * first so an unprefixed link opened later lands on the same language.
   */
  const setLanguage = useCallback(
    (next: Language) => {
      writeStoredLanguage(next);
      const pathname = withLanguage(location.pathname, next);
      navigate({ pathname, search: location.search, hash: location.hash });
    },
    [location, navigate],
  );

  const hrefFor = useCallback(
    (next: Language) => {
      const pathname = withLanguage(location.pathname, next);
      return `${pathname}${location.search}${location.hash}`;
    },
    [location],
  );

  const remember = useCallback((next: Language) => writeStoredLanguage(next), []);

  const value = useMemo<LanguageState>(
    () => ({ language, setLanguage, hrefFor, remember }),
    [language, setLanguage, hrefFor, remember],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
