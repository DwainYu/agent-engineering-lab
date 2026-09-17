import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/Layout";
import { langHref, useLanguage } from "../lib/language";
import { t, type StringKey } from "../lib/strings";

const SUGGESTIONS: { path: string; key: StringKey }[] = [
  { path: "learn", key: "label.timeline" },
  { path: "concepts", key: "label.map" },
  { path: "experiments", key: "nav.experiments" },
  { path: "projects", key: "nav.projects" },
  { path: "progress", key: "nav.progress" },
];

export function NotFoundPage() {
  const { language } = useLanguage();

  return (
    <PageContainer>
      <div className="mx-auto max-w-md py-12 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--faint)]">
          404
        </p>
        <h1 className="mt-3 font-mono text-lg text-[var(--text)]">
          <span className="text-[var(--faint)]">$ cd </span>
          <span className="text-[var(--err)]">./nowhere</span>
          <span className="animate-pulse text-[var(--accent)]">▌</span>
        </h1>
        <p className="mt-3 text-[13px] leading-6 text-[var(--dim)]">
          {t(language, "notFound.body1")}{" "}
          <code className="font-mono text-[12px]">docs/</code> {t(language, "notFound.body2")}{" "}
          <code className="font-mono text-[12px]">npm run generate</code>.
        </p>

        <ul className="mt-8 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((item) => (
            <li key={item.path}>
              <Link
                to={langHref(language, item.path)}
                className="rounded-md border border-[var(--line)] px-3 py-1.5 font-mono text-[12px] text-[var(--dim)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
              >
                {t(language, item.key)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PageContainer>
  );
}
