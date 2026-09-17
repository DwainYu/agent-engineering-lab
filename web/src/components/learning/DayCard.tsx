import { Link } from "react-router-dom";
import type { DayEntry } from "../../../../scripts/lib/types";
import { phaseName } from "../../lib/content";
import { statusGlyph, statusTextClass } from "../../lib/status";
import { StatusPill } from "../ui/Primitives";
import { langHref, useLanguage } from "../../lib/language";

export function DayCard({ day }: { day: DayEntry }) {
  const { language } = useLanguage();

  return (
    <Link
      to={langHref(language, `learn/day/${day.day}`)}
      className="group flex items-start gap-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--accent)]/40"
    >
      <span
        className={`mt-0.5 font-mono text-sm ${statusTextClass[day.status]}`}
        aria-hidden
      >
        {statusGlyph[day.status]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-mono text-[11px] tracking-[0.14em] text-[var(--faint)]">
            DAY {String(day.day).padStart(2, "0")}
          </span>
          <h3 className="truncate text-[15px] font-medium text-[var(--text)] group-hover:text-[var(--accent)]">
            {day.title}
          </h3>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-[var(--dim)]">
          {day.topics.length > 0 ? day.topics.join(" · ") : phaseName(day.phase)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <StatusPill status={day.status} />
        <span className="font-mono text-[11px] text-[var(--faint)]">{day.date}</span>
      </div>
    </Link>
  );
}
