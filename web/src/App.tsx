import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ConceptsPage } from "./pages/ConceptsPage";
import { ExperimentsPage } from "./pages/ExperimentsPage";
import { HomePage } from "./pages/HomePage";
import { LearnPage } from "./pages/LearnPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProgressPage } from "./pages/ProgressPage";
import { ProjectsPage } from "./pages/ProjectsPage";

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

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/day/:day" element={<DayPage />} />
          <Route path="/concepts" element={<ConceptsPage />} />
          <Route path="/concepts/:id" element={<ConceptPage />} />
          <Route path="/comparisons/:id" element={<ComparisonPage />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/experiments/:id" element={<ExperimentPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
