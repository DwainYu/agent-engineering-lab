import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { assistOnPath, site, summary } from "../../lib/content";
import { useReadingMode, type ReadingMode } from "../../lib/reading";
import { githubRepoUrl } from "../../lib/paths";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: "/", label: "Home", end: true },
  { to: "/learn", label: "Learn" },
  { to: "/concepts", label: "Concepts" },
  { to: "/experiments", label: "Experiments" },
  { to: "/projects", label: "Projects" },
  { to: "/progress", label: "Progress" },
  { to: "/about", label: "About" },
];

/** The three destinations that stay visible on a phone (§24). */
const MOBILE_PRIMARY = new Set(["/", "/learn", "/progress"]);

function linkClass({ isActive }: { isActive: boolean }): string {
  return `whitespace-nowrap px-2 py-1 font-mono text-[12px] transition-colors ${
    isActive ? "text-[var(--text)]" : "text-[var(--faint)] hover:text-[var(--text)]"
  }`;
}

/**
 * Reading mode, not a language switch: `中文辅助` reveals the Chinese
 * assistance blocks a note already contains. The control is absent when the
 * current document has none, so it can never promise text that is not there.
 */
function ReadingModeSwitch() {
  const { pathname } = useLocation();
  const { mode, setMode } = useReadingMode();
  if (!assistOnPath(pathname)) return null;

  const options: { id: ReadingMode; label: string; title: string }[] = [
    { id: "en", label: "EN", title: "English only" },
    { id: "assist", label: "中文辅助", title: "Reveal Chinese assistance" },
  ];

  return (
    <div
      role="group"
      aria-label="阅读模式 Reading mode"
      className="flex items-center rounded-md border border-[var(--line)] p-0.5"
    >
      {options.map((option) => {
        const active = mode === option.id;
        return (
          <button
            key={option.id}
            type="button"
            title={option.title}
            aria-pressed={active}
            onClick={() => setMode(option.id)}
            className={`rounded px-1.5 py-0.5 font-mono text-[11px] transition-colors ${
              active
                ? "bg-[var(--elevate)] text-[var(--text)]"
                : "text-[var(--faint)] hover:text-[var(--text)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Header({
  theme,
  onToggleTheme,
}: {
  theme: string;
  onToggleTheme: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid size-6 place-items-center rounded border border-[var(--line)] bg-[var(--surface)] font-mono text-[11px] font-bold text-[var(--accent)]">
            A
          </span>
          <span className="font-mono text-[13px] font-semibold tracking-tight">
            agent-engineering-lab
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden font-mono text-[11px] text-[var(--faint)] sm:inline">
            Day {summary.currentDay} / {summary.totalDays}
          </span>
          <ReadingModeSwitch />
          <a
            href={githubRepoUrl(site.repo)}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-md border border-[var(--line)] px-2.5 py-1 font-mono text-[12px] text-[var(--dim)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text)] md:inline-block"
          >
            GitHub
          </a>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="grid size-8 place-items-center rounded-md border border-[var(--line)] text-[13px] text-[var(--dim)] transition-colors hover:text-[var(--text)]"
          >
            {theme === "dark" ? "☾" : "☀"}
          </button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={open}
            className="grid size-8 place-items-center rounded-md border border-[var(--line)] text-[13px] text-[var(--dim)] lg:hidden"
          >
            {open ? "×" : "≡"}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[var(--line)] bg-[var(--surface)] p-3 lg:hidden">
          <div className="grid gap-1 sm:grid-cols-2">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 font-mono text-[13px] ${
                    isActive
                      ? "bg-[var(--elevate)] text-[var(--text)]"
                      : "text-[var(--dim)] hover:text-[var(--text)]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

/** Secondary bar shown on small screens: the daily-drivers only. */
export function MobileNav() {
  return (
    <div className="flex items-center gap-1 border-b border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 lg:hidden">
      {NAV.filter((item) => MOBILE_PRIMARY.has(item.to)).map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}
