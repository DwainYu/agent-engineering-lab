import type { ReactNode } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { isLanguage, readStoredLanguage, withLanguage } from "../../lib/language";
import { NotFoundPage } from "../../pages/NotFoundPage";

/**
 * Guards the `/:lang/…` tree: an unknown prefix is a 404, not a stray English
 * page. Pages inside read the language from `LanguageProvider`, which derives
 * it from the path — so the URL stays the single source of truth.
 */
export function LanguageRoute({ children }: { children: ReactNode }) {
  const { lang } = useParams();
  if (lang === undefined || !isLanguage(lang)) return <NotFoundPage />;
  return <>{children}</>;
}

/**
 * Send a request without a language prefix to the remembered one:
 * `/` → `/en`, `/learn/day/1` → `/en/learn/day/1`. Old links stay alive instead
 * of 404ing.
 */
export function LanguageRedirect() {
  const { pathname, search, hash } = useLocation();
  const target = withLanguage(pathname, readStoredLanguage());
  return <Navigate to={{ pathname: target, search, hash }} replace />;
}
