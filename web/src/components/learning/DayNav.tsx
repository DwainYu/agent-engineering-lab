import { Link } from "react-router-dom";
import { dayByNumber } from "../../lib/content";

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
        {title ?? "Nothing yet"}
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
  const previous = dayByNumber(String(day - 1));
  const next = dayByNumber(String(day + 1));
  const maxDay = Math.max(0, ...[day, previous?.day ?? 0, next?.day ?? 0]);

  return (
    <nav className="mt-10 flex items-stretch justify-between gap-3 border-t border-[var(--line)] pt-6">
      <Item
        to={previous ? `/learn/day/${previous.day}` : null}
        label="← Previous Day"
        title={previous ? `Day ${previous.day} · ${previous.title}` : undefined}
        align="left"
      />
      <Item
        to={next && day < maxDay ? `/learn/day/${next.day}` : null}
        label={next ? "Next Day →" : "Next Day →"}
        title={next ? `Day ${next.day} · ${next.title}` : "planned"}
        align="right"
      />
    </nav>
  );
}
