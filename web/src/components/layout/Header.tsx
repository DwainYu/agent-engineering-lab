import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { site, summary } from "../../lib/content";
import { githubRepoUrl } from "../../lib/paths";
import {
  LANGUAGES,
  LANGUAGE_LABEL,
  langHref,
  useLanguage,
} from "../../lib/language";
import { t, type StringKey } from "../../lib/strings";

interface NavItem {
  path: string;
  key: StringKey;
  end?: boolean;
}

const NAV: NavItem[] = [
  { path: "", key: "nav.home", end: true },
  { path: "learn", key: "nav.learn" },
  { path: "concepts", key: "nav.concepts" },
  { path: "experiments", key: "nav.experiments" },
  { path: "projects", key: "nav.projects" },
  { path: "progress", key: "nav.progress" },
  { path: "about", key: "nav.about" },
];

/** The three destinations that stay visible on a phone (§24). */
const MOBILE_PRIMARY = new Set(["", "learn", "progress"]);

function linkClass({ isActive }: { isActive: boolean }): string {
  return `whitespace-nowrap px-2 py-1 font-mono text-[12px] transition-colors ${
    isActive ? "text-[var(--text)]" : "text-[var(--faint)] hover:text-[var(--text)]"
  }`;
}

/**
 * `EN | 中文` is a navigation, not a local mode flag: it keeps the current
 * document id and only swaps the language prefix. The URL stays the source of
 * truth, so the link can be opened in a new tab or sent to someone else.
 */
function LanguageSwitch() {
  const { language, hrefFor, remember } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t(language, "lang.switch")}
      className="flex items-center rounded-md border border-[var(--line)] p-0.5"
    >
      {LANGUAGES.map((option) => {
        const active = language === option;
        return (
          <Link
            key={option}
            to={hrefFor(option)}
            onClick={() => remember(option)}
            lang={option}
            title={LANGUAGE_LABEL[option]}
            aria-current={active ? "true" : undefined}
            className={`rounded px-1.5 py-0.5 font-mono text-[11px] transition-colors ${
              active
                ? "bg-[var(--elevate)] text-[var(--text)]"
                : "text-[var(--faint)] hover:text-[var(--text)]"
            }`}
          >
            {LANGUAGE_LABEL[option]}
          </Link>
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
  const { language } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link
          to={langHref(language)}
          className="flex items-center gap-2"
          onClick={() => setOpen(false)}
        >
          <span className="grid size-6 place-items-center rounded border border-[var(--line)] bg-[var(--surface)] font-mono text-[11px] font-bold text-[var(--accent)]">
            A
          </span>
          <span className="font-mono text-[13px] font-semibold tracking-tight">
            agent-engineering-lab
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.key}
              to={langHref(language, item.path)}
              end={item.end}
              className={linkClass}
            >
              {t(language, item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden font-mono text-[11px] text-[var(--faint)] sm:inline">
            {t(language, "day.counter", { current: summary.currentDay, total: summary.totalDays })}
          </span>
          <LanguageSwitch />
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
                key={item.path}
                to={langHref(language, item.path)}
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
                {t(language, item.key)}
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
  const { language } = useLanguage();

  return (
    <div className="flex items-center gap-1 border-b border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 lg:hidden">
      {NAV.filter((item) => MOBILE_PRIMARY.has(item.path)).map((item) => (
        <NavLink key={item.path} to={langHref(language, item.path)} end={item.end} className={linkClass}>
          {t(language, item.key)}
        </NavLink>
      ))}
    </div>
  );
}
