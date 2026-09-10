import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";

function useThemeClass() {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("lab-theme") ?? "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("lab-theme", theme);
  }, [theme]);

  return { theme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { theme, toggle } = useThemeClass();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header theme={theme} onToggleTheme={toggle} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageContainer({
  title,
  description,
  meta,
  children,
  wide = false,
}: {
  title?: string;
  description?: string;
  meta?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-8 ${
        wide ? "max-w-6xl" : "max-w-4xl"
      }`}
    >
      {(title || description) && (
        <header className="mb-8 border-b border-[var(--line)] pb-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              {title && (
                <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[var(--dim)]">
                  {description}
                </p>
              )}
            </div>
            {meta && <div className="flex items-center gap-2">{meta}</div>}
          </div>
        </header>
      )}
      {children}
    </div>
  );
}
