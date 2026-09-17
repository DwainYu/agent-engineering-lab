import { Link } from "react-router-dom";
import { dayByNumber } from "../../lib/content";
import { langHref, useLanguage } from "../../lib/language";
import { t } from "../../lib/strings";

function Item({
  to,
  label,
  title,
  align,
}: {
  to: string | null;
  label: string;
  title?: string;
  align: "left" | "right";
}) {
  const { language } = useLanguage();

  const inner = (
    <>
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--faint)]">
        {label}
      </span>
      <span
        className={`block truncate text-sm ${
          to
            ? "text-[var(--text)]"
            : "text-[var(--faint)] line-through decoration-[var(--line)]"
        }`}
      >
        {title ?? t(language, "label.nothing")}
      </span>
    </>
  );

  return (
    <div className={`w-1/2 ${align === "right" ? "text-right" : ""}`}>
      {to ? (
        <Link
          to={to}
          className={`group block rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3 transition-colors hover:border-[var(--accent)]/40 ${
            align === "right" ? "border-[var(--line)]" : ""
          }`}
        >
          {inner}
        </Link>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--line)] px-4 py-3 opacity-60">
          {inner}
        </div>
      )}
    </div>
  );
}

export function DayNav({ day }: { day: number }) {
  const { language } = useLanguage();
  const previous = dayByNumber(language, String(day - 1));
  const next = dayByNumber(language, String(day + 1));
  const maxDay = Math.max(0, ...[day, previous?.day ?? 0, next?.day ?? 0]);

  return (
    <nav className="mt-10 flex items-stretch justify-between gap-3 border-t border-[var(--line)] pt-6">
      <Item
        to={previous ? langHref(language, `learn/day/${previous.day}`) : null}
        label={t(language, "day.previous")}
        title={previous ? t(language, "day.entry", { day: previous.day, title: previous.title }) : undefined}
        align="left"
      />
      <Item
        to={next && day < maxDay ? langHref(language, `learn/day/${next.day}`) : null}
        label={t(language, "day.next")}
        title={next ? t(language, "day.entry", { day: next.day, title: next.title }) : t(language, "label.planned")}
        align="right"
      />
    </nav>
  );
}
