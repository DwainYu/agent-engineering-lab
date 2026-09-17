import { useMemo } from "react";
import { Link } from "react-router-dom";
import { langHref, useLanguage } from "../../lib/language";
import { t } from "../../lib/strings";
import type { DayEntry } from "../../../../scripts/lib/types";

const CELL = 11;
const GAP = 3;
const LEFT = 18;
const TOP = 16;
const MONTH_NAMES_EN = [
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
] as const;
const MONTH_NAMES_ZH = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
] as const;
const STATUS_LABELS_EN = {
  completed: "completed",
  learning: "learning",
  planned: "planned",
} as const;
const STATUS_LABELS_ZH = {
  completed: "已完成",
  learning: "学习中",
  planned: "计划中",
} as const;

/**
 * GitHub-style calendar built from the Day notes themselves (§19) —
 * no GitHub API, the repository is the record.
 */
export function Heatmap({ days }: { days: DayEntry[] }) {
  const { language } = useLanguage();
  const monthNames = language === "zh" ? MONTH_NAMES_ZH : MONTH_NAMES_EN;
  const statusLabels = language === "zh" ? STATUS_LABELS_ZH : STATUS_LABELS_EN;

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
        months.push({ label: monthNames[cursor.getUTCMonth()] ?? "", x });
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
    // Re-calculate when language changes so month labels update without remounting.
  }, [days, monthNames]);

  const width = LEFT + weeks * (CELL + GAP) + CELL;
  const height = TOP + 7 * (CELL + GAP) + CELL;

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={t(language, "heatmap.calendar")}
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
                  ? t(language, "heatmap.dayX", {
                      day: day.day,
                      title: day.title,
                      status: statusLabels[day.status] ?? day.status,
                    })
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
        <span>
          {dayByDate.size} {t(language, "label.daysPlural")}
        </span>
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
              {statusLabels[status] ?? status}
            </span>
          ))}
        </span>
      </div>

      {days.length > 0 && (
        <p className="mt-2 text-[11px] text-[var(--faint)]">
          {t(language, "heatmap.source1")}{" "}
          <Link to={langHref(language, "learn")} className="text-[var(--accent)]">
            docs/{language}/daily/
          </Link>{" "}
          {t(language, "heatmap.source2")}
        </p>
      )}
    </div>
  );
}
