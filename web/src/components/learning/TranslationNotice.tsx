import { Link } from "react-router-dom";
import { langHref, otherLanguage, type Language } from "../../lib/language";
import { t } from "../../lib/strings";
import { PageContainer } from "../layout/Layout";

/**
 * Shown when the reader asked for a language this document does not exist in
 * yet. It never invents a translation — it names the gap and hands back the
 * version that does exist.
 *
 * @param path route suffix shared by both trees, e.g. `learn/day/3`
 */
export function TranslationMissing({
  language,
  title,
  path,
}: {
  language: Language;
  title: string;
  path: string;
}) {
  const fallback = otherLanguage(language);
  const missing =
    fallback === "en" ? t(language, "lang.missing.zh") : t(language, "lang.missing.en");

  return (
    <PageContainer title={title} description={missing}>
      <div className="rounded-lg border border-dashed border-[var(--warn)]/40 bg-[var(--surface)] px-6 py-10 text-center">
        <p className="font-mono text-[13px] text-[var(--warn)]">{missing}</p>
        <div className="mt-5">
          <Link
            to={langHref(fallback, path)}
            className="rounded-md border border-[var(--line)] px-4 py-2 font-mono text-[12px] text-[var(--dim)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
          >
            {fallback === "en"
              ? t(language, "lang.view.en")
              : t(language, "lang.view.zh")}
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
