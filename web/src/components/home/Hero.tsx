import { Link } from "react-router-dom";
import { site, summary } from "../../lib/content";
import { langHref, useLanguage } from "../../lib/language";
import { t } from "../../lib/strings";

const PIPELINE = [
  "pipeline.learn",
  "pipeline.reproduce",
  "pipeline.experiment",
  "pipeline.build",
] as const;

export function Hero() {
  const { language } = useLanguage();

  const pct = Math.max(2, Math.min(100, summary.completionRate));
  const done = Math.round((pct / 100) * 28);

  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--faint)]">
          {site.name}
        </p>

        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-[var(--text)] sm:text-5xl">
          {t(language, "hero.line1")}
          <span className="block text-[var(--accent)]">{t(language, "hero.line2")}</span>
        </h1>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[12px] text-[var(--dim)]">
          {PIPELINE.map((step, index) => (
            <span key={step} className="flex items-center gap-2">
              {index > 0 && <span className="text-[var(--faint)]">→</span>}
              {t(language, step)}
            </span>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-md">
          <div className="flex items-baseline justify-between font-mono text-[12px]">
            <span className="text-[var(--text)]">
              {t(language, "day.counter", {
                current: summary.currentDay,
                total: summary.totalDays,
              })}
            </span>
            <span className="text-[var(--faint)]">{summary.completionRate}%</span>
          </div>
          <div
            className="mt-2 flex h-2 gap-[3px] overflow-hidden"
            role="img"
            aria-label={`${summary.completionRate}% of the plan completed`}
          >
            {Array.from({ length: 28 }, (_, index) => (
              <span
                key={index}
                className={`h-full flex-1 rounded-[1px] ${
                  index < done ? "bg-[var(--accent)]" : "bg-[var(--elevate)]"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={langHref(language, `learn/day/${summary.currentDay || 1}`)}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#06231b] transition-opacity hover:opacity-90 dark:text-[#04140f]"
          >
            {t(language, "label.continue")}
          </Link>
          <Link
            to={langHref(language, "learn")}
            className="rounded-md border border-[var(--line)] px-4 py-2 font-mono text-[13px] text-[var(--dim)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
          >
            {t(language, "label.timeline")}
          </Link>
        </div>
      </div>
    </section>
  );
}
