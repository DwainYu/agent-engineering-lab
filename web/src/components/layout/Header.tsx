import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { site, summary } from "../../lib/content";
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
