import { Link } from "react-router-dom";
import { recentDays } from "../../lib/content";
import { langHref, useLanguage } from "../../lib/language";
import { t } from "../../lib/strings";
import { statusGlyph, statusTextClass } from "../../lib/status";
import { SectionTitle } from "../ui/Primitives";

/** Reverse-chronological list of the days I actually worked on (§13). */
export function LearningTimeline({ count = 5 }: { count?: number }) {
  const { language } = useLanguage();

  const items = recentDays(language, count);

  return (
    <section>
      <SectionTitle
        hint={
          <Link to={langHref(language, "learn")} className="hover:text-[var(--text)]">
            {t(language, "label.allDays")}
          </Link>
        }
      >
        {t(language, "label.timeline")}
      </SectionTitle>

      <ol className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]">
        {items.map((day, index) => (
          <li key={day.slug}>
            <Link
              to={langHref(language, `learn/day/${day.day}`)}
              className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[var(--elevate)] ${
                index > 0 ? "border-t border-[var(--line)]" : ""
              }`}
            >
              <span
                className={`font-mono text-xs ${statusTextClass[day.status]}`}
                aria-hidden
              >
                {statusGlyph[day.status]}
              </span>
              <span className="w-16 shrink-0 font-mono text-[11px] text-[var(--faint)]">
                {t(language, "day.entry", {
                  day: String(day.day).padStart(2, "0"),
                  title: day.title,
                })}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-[var(--text)]">
                {day.title}
              </span>
              <span className="hidden shrink-0 font-mono text-[11px] text-[var(--faint)] sm:block">
                {day.date}
              </span>
            </Link>
          </li>
        ))}
        {items.length === 0 && (
          <li className="px-4 py-6 text-center font-mono text-[12px] text-[var(--faint)]">
            {t(language, "home.noDays")}
          </li>
        )}
      </ol>
    </section>
  );
}
