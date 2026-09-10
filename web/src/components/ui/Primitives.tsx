import type { ReactNode } from "react";
import type { Status } from "../../../../scripts/lib/types";
import { statusGlyph, statusLabel, statusPillClass } from "../../lib/status";

export function Pill({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] leading-4 ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusPill({
  status,
  showGlyph = true,
}: {
  status: Status;
  showGlyph?: boolean;
}) {
  return (
    <Pill className={statusPillClass[status]}>
      {showGlyph && <span aria-hidden>{statusGlyph[status]}</span>}
      {statusLabel[status]}
    </Pill>
  );
}

export function CategoryPill({ children }: { children: ReactNode }) {
  return <Pill className="border-[var(--line)] text-[var(--dim)]">{children}</Pill>;
}

export function ProgressBar({
  value,
  status = "learning",
  label,
}: {
  value: number;
  status?: Status;
  label?: string;
}) {
  const width = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--elevate)]"
        role="progressbar"
        aria-valuenow={width}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "progress"}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            status === "completed"
              ? "bg-[var(--ok)]"
              : status === "planned"
                ? "bg-[var(--todo)]"
                : "bg-[var(--accent)]"
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-9 shrink-0 text-right font-mono text-[11px] text-[var(--faint)]">
        {width}%
      </span>
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--line)] px-6 py-12 text-center">
      <p className="font-mono text-sm text-[var(--dim)]">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--faint)]">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionTitle({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--faint)]">
        {children}
      </h2>
      {hint && <div className="text-xs text-[var(--faint)]">{hint}</div>}
    </div>
  );
}
