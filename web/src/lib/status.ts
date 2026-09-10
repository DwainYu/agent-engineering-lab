import type { Status } from "../../../scripts/lib/types";

export const statusLabel: Record<Status, string> = {
  planned: "Planned",
  learning: "Learning",
  completed: "Completed",
};

/** ✓ / ◐ / ○ — the glyph language used across the site (§16). */
export const statusGlyph: Record<Status, string> = {
  planned: "○",
  learning: "◐",
  completed: "✓",
};

export const statusTextClass: Record<Status, string> = {
  planned: "text-[var(--faint)]",
  learning: "text-[var(--warn)]",
  completed: "text-[var(--ok)]",
};

export const statusPillClass: Record<Status, string> = {
  planned: "border-[var(--line)] text-[var(--dim)]",
  learning: "border-[var(--warn)]/40 text-[var(--warn)]",
  completed: "border-[var(--ok)]/40 text-[var(--ok)]",
};

export const statusBarClass: Record<Status, string> = {
  planned: "bg-[var(--todo)]",
  learning: "bg-[var(--warn)]",
  completed: "bg-[var(--ok)]",
};

export const statusOrder: Status[] = ["completed", "learning", "planned"];
