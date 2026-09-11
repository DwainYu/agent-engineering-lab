import type { ReactNode } from "react";
import { useReadingMode } from "../../lib/reading";

/**
 * A `> **中文理解**` blockquote from a learning note.
 *
 * It is a reading aid, not a translation: quieter than the English body it
 * follows, same surface palette, no accent colour that could out-shout the text.
 * When the reader is in English mode the block is not rendered at all, so an
 * English-only visit looks exactly like a site with no assistance feature.
 */
export function ChineseAssistBlock({
  deep = false,
  children,
}: {
  deep?: boolean;
  children: ReactNode;
}) {
  const { mode } = useReadingMode();
  if (mode !== "assist") return null;

  return (
    <aside
      lang="zh-CN"
      className="my-5 rounded-md border border-[var(--line)] bg-[var(--surface)] px-4 py-3"
    >
      <div className="mb-1 font-mono text-[10px] tracking-wide text-[var(--faint)]">
        {deep ? "中文深入理解" : "中文理解"}
      </div>
      <div className="assist-body text-[14px] leading-7 text-[var(--dim)]">
        {children}
      </div>
    </aside>
  );
}
