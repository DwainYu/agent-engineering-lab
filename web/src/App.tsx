import { Suspense, lazy } from "react";
import type { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import { LanguageRedirect, LanguageRoute } from "./components/layout/LanguageRoute";
import { Layout } from "./components/layout/Layout";
import { ConceptsPage } from "./pages/ConceptsPage";
import { ExperimentsPage } from "./pages/ExperimentsPage";
import { HomePage } from "./pages/HomePage";
import { LearnPage } from "./pages/LearnPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProgressPage } from "./pages/ProgressPage";
import { ProjectsPage } from "./pages/ProjectsPage";

/** Every section that can appear without a language prefix in an old link. */
const LEGACY_SECTIONS = [
  "learn",
  "concepts",
  "comparisons",
  "experiments",
  "projects",
  "progress",
  "about",
];

/*
 * The document pages pull in the markdown renderer and the highlight.js
 * grammars, which is the heaviest part of the bundle. Loading them on demand
 * keeps the first paint of Home and the list pages small.
 */
const AboutPage = lazy(() =>
  import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);
const ComparisonPage = lazy(() =>
  import("./pages/ComparisonPage").then((m) => ({ default: m.ComparisonPage })),
);
const ConceptPage = lazy(() =>
  import("./pages/ConceptPage").then((m) => ({ default: m.ConceptPage })),
);
const DayPage = lazy(() =>
  import("./pages/DayPage").then((m) => ({ default: m.DayPage })),
);
const ExperimentPage = lazy(() =>
  import("./pages/ExperimentPage").then((m) => ({ default: m.ExperimentPage })),
);

function PageFallback() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center font-mono text-[12px] text-[var(--faint)] sm:px-6">
      loading…
    </div>
  );
}

/** Wrap a page so it only answers inside a real `/:lang/…` subtree. */
function localized(element: ReactElement) {
  return <LanguageRoute>{element}</LanguageRoute>;
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* The language-prefixed tree: the URL decides which documents render. */}
          <Route path="/:lang" element={localized(<HomePage />)} />
          <Route path="/:lang/learn" element={localized(<LearnPage />)} />
          <Route path="/:lang/learn/day/:day" element={localized(<DayPage />)} />
          <Route path="/:lang/concepts" element={localized(<ConceptsPage />)} />
          <Route path="/:lang/concepts/:id" element={localized(<ConceptPage />)} />
          <Route path="/:lang/comparisons/:id" element={localized(<ComparisonPage />)} />
          <Route path="/:lang/experiments" element={localized(<ExperimentsPage />)} />
          <Route path="/:lang/experiments/:id" element={localized(<ExperimentPage />)} />
          <Route path="/:lang/projects" element={localized(<ProjectsPage />)} />
          <Route path="/:lang/progress" element={localized(<ProgressPage />)} />
          <Route path="/:lang/about" element={localized(<AboutPage />)} />

          {/* Links written before the split keep working: `/learn/day/1` lands
              on `/en/learn/day/1`. An unknown prefix still 404s instead of
              being silently rewritten into English. */}
          {LEGACY_SECTIONS.map((section) => (
            <Route key={section} path={`/${section}/*`} element={<LanguageRedirect />} />
          ))}

          <Route path="/" element={<LanguageRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
