import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/Layout";

const SUGGESTIONS = [
  { to: "/learn", label: "Learning timeline" },
  { to: "/concepts", label: "Concept map" },
  { to: "/experiments", label: "Experiments" },
  { to: "/projects", label: "Projects" },
  { to: "/progress", label: "Progress" },
];

export function NotFoundPage() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-md py-12 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--faint)]">
          404
        </p>
        <h1 className="mt-3 font-mono text-lg text-[var(--text)]">
          <span className="text-[var(--faint)]">$ cd </span>
          <span className="text-[var(--err)]">./nowhere</span>
          <span className="animate-pulse text-[var(--accent)]">▌</span>
        </h1>
        <p className="mt-3 text-[13px] leading-6 text-[var(--dim)]">
          No markdown file resolves to this route. If it should exist, add it under{" "}
          <code className="font-mono text-[12px]">docs/</code> and run{" "}
          <code className="font-mono text-[12px]">npm run generate</code>.
        </p>

        <ul className="mt-8 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="rounded-md border border-[var(--line)] px-3 py-1.5 font-mono text-[12px] text-[var(--dim)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PageContainer>
  );
}
