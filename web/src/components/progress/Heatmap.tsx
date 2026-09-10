import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { DayEntry } from "../../../../scripts/lib/types";

const CELL = 11;
const GAP = 3;
const LEFT = 18;
const TOP = 16;
const WEEK_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * GitHub-style calendar built from the Day notes themselves (§19) —
 * no GitHub API, the repository is the record.
 */
export function Heatmap({ days }: { days: DayEntry[] }) {
  const { cells, weeks, first, last, months, dayByDate } = useMemo(() => {
    const byDate = new Map<string, DayEntry>();
    for (const day of days) {
      if (day.date) byDate.set(day.date, day);
    }
    const dates = [...byDate.keys()].sort();
    const start = dates[0] ?? new Date().toISOString().slice(0, 10);
    const end = dates[dates.length - 1] ?? start;

    const first = new Date(`${start}T00:00:00Z`);
    const last = new Date(`${end}T00:00:00Z`);
    // align the grid to the Monday of the first recorded week
    const offset = (first.getUTCDay() + 6) % 7;
    const cursor = new Date(first.getTime() - offset * 86_400_000);

    const cells: { date: string; day?: DayEntry; x: number; y: number }[] = [];
    const months: { label: string; x: number }[] = [];
    let weeks = 0;
    let previousMonth = -1;

    while (cursor <= last) {
      const iso = cursor.toISOString().slice(0, 10);
      const week = Math.floor(cells.length / 7);
      const x = LEFT + week * (CELL + GAP);
      if (cursor.getUTCMonth() !== previousMonth) {
        months.push({ label: WEEK_LABELS[cursor.getUTCMonth()] ?? "", x });
        previousMonth = cursor.getUTCMonth();
      }
      cells.push({
        date: iso,
        day: byDate.get(iso),
        x,
        y: TOP + (cells.length % 7) * (CELL + GAP),
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      weeks = week + 1;
    }

    return { cells, weeks, first, last, months, dayByDate: byDate };
  }, [days]);

  const width = LEFT + weeks * (CELL + GAP) + CELL;
  const height = TOP + 7 * (CELL + GAP) + CELL;

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label="Learning calendar"
      >
        {months.map((month) => (
          <text
            key={`${month.label}-${month.x}`}
            x={month.x}
            y={10}
            className="fill-[var(--faint)] font-mono"
            style={{ fontSize: 9 }}
          >
            {month.label}
          </text>
        ))}
        {["M", "W", "F", "S"].map((label, index) => (
          <text
            key={label}
            x={2}
            y={TOP + [0, 2, 4, 6][index]! * (CELL + GAP) + CELL - 1}
            className="fill-[var(--faint)] font-mono"
            style={{ fontSize: 8 }}
          >
            {label}
          </text>
        ))}
        {cells.map((cell) => {
          const day = cell.day;
          const fill = !day
            ? "var(--elevate)"
            : day.status === "completed"
              ? "var(--ok)"
              : day.status === "learning"
                ? "var(--warn)"
                : "var(--todo)";
          return (
            <rect
              key={cell.date}
              x={cell.x}
              y={cell.y}
              width={CELL}
              height={CELL}
              rx={2}
              fill={fill}
              opacity={day ? 1 : 0.45}
            >
              <title>
                {day
                  ? `Day ${day.day} — ${day.title} (${day.status})`
                  : `${cell.date} — no record`}
              </title>
            </rect>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-[var(--faint)]">
        <span>
          {first.toISOString().slice(0, 10)} → {last.toISOString().slice(0, 10)}
        </span>
        <span>{dayByDate.size} recorded days</span>
        <span className="ml-auto flex items-center gap-3">
          {(["completed", "learning", "planned"] as const).map((status) => (
            <span key={status} className="flex items-center gap-1.5">
              <i
                className="inline-block size-2.5 rounded-[2px]"
                style={{
                  background:
                    status === "completed"
                      ? "var(--ok)"
                      : status === "learning"
                        ? "var(--warn)"
                        : "var(--todo)",
                }}
              />
              {status}
            </span>
          ))}
        </span>
      </div>

      {days.length > 0 && (
        <p className="mt-2 text-[11px] text-[var(--faint)]">
          Each cell comes from{" "}
          <Link to="/learn" className="text-[var(--accent)]">
            docs/daily/
          </Link>{" "}
          frontmatter.
        </p>
      )}
    </div>
  );
}
