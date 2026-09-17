import { Link } from "react-router-dom";
import type { ConceptEntry } from "../../../../scripts/lib/types";
import { statusGlyph, statusTextClass } from "../../lib/status";
import { langHref, useLanguage } from "../../lib/language";
import { t } from "../../lib/strings";

const GROUP_ORDER = ["fundamentals", "runtime", "tools", "architecture"];

/**
 * Knowledge map as plain SVG — no graph library (§16).
 * Columns are layers, links are prerequisite → concept.
 */
export function ConceptGraph({ concepts }: { concepts: ConceptEntry[] }) {
  const { language } = useLanguage();

  const byCategory = new Map<string, ConceptEntry[]>();
  for (const concept of concepts) {
    const list = byCategory.get(concept.category) ?? [];
    list.push(concept);
    byCategory.set(concept.category, list);
  }

  const categories = [
    ...GROUP_ORDER.filter((category) => byCategory.has(category)),
    ...[...byCategory.keys()]
      .filter((category) => !GROUP_ORDER.includes(category))
      .sort(),
  ];

  const columnWidth = 208;
  const rowHeight = 46;
  const headerHeight = 34;
  const padding = 16;

  const positions = new Map<string, { x: number; y: number }>();
  categories.forEach((category, columnIndex) => {
    (byCategory.get(category) ?? []).forEach((concept, rowIndex) => {
      positions.set(concept.id, {
        x: padding + columnIndex * columnWidth + columnWidth / 2,
        y: headerHeight + padding + rowIndex * rowHeight + rowHeight / 2,
      });
    });
  });

  const rows = Math.max(
    1,
    ...categories.map((category) => (byCategory.get(category) ?? []).length),
  );
  const width = padding * 2 + categories.length * columnWidth;
  const height = headerHeight + padding * 2 + rows * rowHeight;

  const links = concepts.flatMap((concept) =>
    concept.prerequisites
      .map((prerequisite) => ({
        from: positions.get(prerequisite),
        to: positions.get(concept.id),
        key: `${prerequisite}->${concept.id}`,
      }))
      .filter(
        (
          link,
        ): link is {
          from: { x: number; y: number };
          to: { x: number; y: number };
          key: string;
        } => Boolean(link.from && link.to),
      ),
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="min-w-full"
        role="img"
        aria-label={t(language, "label.map")}
      >
        {categories.map((category, index) => (
          <text
            key={category}
            x={padding + index * columnWidth + 6}
            y={22}
            className="fill-[var(--faint)] font-mono uppercase"
            style={{ fontSize: 9, letterSpacing: "0.16em" }}
          >
            {category}
          </text>
        ))}

        {links.map((link) => (
          <line
            key={link.key}
            x1={link.from.x}
            y1={link.from.y}
            x2={link.to.x}
            y2={link.to.y}
            stroke="var(--line)"
            strokeWidth={1}
          />
        ))}

        {concepts.map((concept) => {
          const position = positions.get(concept.id);
          if (!position) return null;
          const halfWidth = columnWidth / 2 - 18;
          return (
            <foreignObject
              key={concept.id}
              x={position.x - halfWidth}
              y={position.y - 16}
              width={halfWidth * 2}
              height={32}
            >
              <Link
                to={langHref(language, `concepts/${concept.id}`)}
                className="flex h-full items-center gap-2 truncate rounded-md border border-[var(--line)] bg-[var(--bg)] px-2.5 font-mono text-[11px] text-[var(--text)] no-underline transition-colors hover:border-[var(--accent)]/50"
              >
                <span className={statusTextClass[concept.status]} aria-hidden>
                  {statusGlyph[concept.status]}
                </span>
                <span className="truncate">{concept.title}</span>
              </Link>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
}
