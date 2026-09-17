// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AboutPage } from "../web/src/pages/AboutPage";
import { ComparisonPage } from "../web/src/pages/ComparisonPage";
import { ConceptPage } from "../web/src/pages/ConceptPage";
import { ConceptsPage } from "../web/src/pages/ConceptsPage";
import { DayPage } from "../web/src/pages/DayPage";
import { ExperimentPage } from "../web/src/pages/ExperimentPage";
import { ExperimentsPage } from "../web/src/pages/ExperimentsPage";
import { HomePage } from "../web/src/pages/HomePage";
import { LearnPage } from "../web/src/pages/LearnPage";
import { NotFoundPage } from "../web/src/pages/NotFoundPage";
import { ProgressPage } from "../web/src/pages/ProgressPage";
import { ProjectsPage } from "../web/src/pages/ProjectsPage";
import App from "../web/src/App";
import { LanguageProvider } from "../web/src/components/layout/LanguageProvider";
import {
  comparisons,
  concepts,
  days,
  experiments,
  progress,
  site,
  summary,
} from "../web/src/lib/content";

afterEach(cleanup);

/** Render one route the way the router would — inside the global providers. */
function renderRoute(entry: string, pattern: string, element: ReactElement) {
  const prefixed = (path: string) => (path === "/" ? "/en" : `/en${path}`);
  render(
    <MemoryRouter initialEntries={[prefixed(entry)]}>
      <LanguageProvider>
        <Routes>
          <Route path={`/:lang${pattern === "/" ? "" : pattern}`} element={element} />
        </Routes>
      </LanguageProvider>
    </MemoryRouter>,
  );
}

const bodyText = (): string => document.body.textContent ?? "";
const heading = (): string => document.querySelector("h1")?.textContent ?? "";

/*
 * Smoke tests over the real generated data. Every list on this site is derived
 * from Markdown, so the thing most likely to break a page is a renamed or
 * dropped field — these tests fail loudly when that happens.
 */
describe("pages render from generated data", () => {
  it("Home shows the pipeline and the current day", () => {
    renderRoute("/", "/", <HomePage />);
    expect(bodyText()).toContain("Learn");
    expect(bodyText()).toContain("Reproduce");
    expect(bodyText()).toContain("Experiment");
    expect(bodyText()).toContain("Build");
    expect(bodyText()).toContain(`Day ${summary.currentDay} / ${summary.totalDays}`);
    expect(bodyText()).toContain("Learning timeline");
  });

  it("Learn lists every day note", () => {
    renderRoute("/learn", "/learn", <LearnPage />);
    for (const day of days) {
      expect(bodyText()).toContain(day.title);
      expect(bodyText()).toContain(`DAY ${String(day.day).padStart(2, "0")}`);
    }
  });

  it("Day renders markdown with highlighted code and a disabled checklist", () => {
    const day = days.find((item) => item.status === "completed") ?? days[0]!;
    renderRoute(`/learn/day/${day.day}`, "/learn/day/:day", <DayPage />);
    expect(heading()).toBe(day.title);
    expect(document.querySelector("pre code.hljs")).toBeTruthy();
    expect(document.querySelector('input[type="checkbox"][disabled]')).toBeTruthy();
    expect(document.querySelector(".markdown")?.textContent).toContain("Key Takeaways");
    expect(bodyText()).toContain("Next Day");
  });

  it("Learn filters by status without touching data", () => {
    renderRoute("/learn", "/learn", <LearnPage />);
    const buttons = [...document.querySelectorAll("button")].map(
      (node) => node.textContent,
    );
    expect(buttons).toContain("All");
    expect(buttons).toContain("Completed");
  });

  it("Concepts lists every node and the map", () => {
    renderRoute("/concepts", "/concepts", <ConceptsPage />);
    expect(bodyText().toLowerCase()).toContain("knowledge map");
    expect(document.querySelectorAll("svg").length).toBeGreaterThan(0);
    for (const concept of concepts) {
      expect(bodyText()).toContain(concept.title);
    }
  });

  it("Concept renders one node with its links and project pointers", () => {
    const concept = concepts.find((item) => item.trainingProject) ?? concepts[0]!;
    renderRoute(`/concepts/${concept.id}`, "/concepts/:id", <ConceptPage />);
    expect(heading()).toBe(concept.title);
    expect(bodyText()).toContain("Prerequisites");
    expect(bodyText()).toContain("Where it lives");
    expect(bodyText()).toContain(concept.category);
  });

  it("Comparison renders the architecture note", () => {
    const comparison = comparisons[0]!;
    renderRoute(`/comparisons/${comparison.id}`, "/comparisons/:id", <ComparisonPage />);
    expect(heading()).toBe(comparison.title);
    expect(bodyText()).toContain("Concepts");
    expect(document.querySelector(".markdown")?.textContent?.length).toBeGreaterThan(200);
  });

  it("Experiments lists every notebook and one experiment shows its code location", () => {
    renderRoute("/experiments", "/experiments", <ExperimentsPage />);
    for (const experiment of experiments) {
      expect(bodyText()).toContain(experiment.title);
    }

    cleanup();
    const target = experiments.find((item) => item.trainingProject) ?? experiments[0]!;
    renderRoute(`/experiments/${target.id}`, "/experiments/:id", <ExperimentPage />);
    expect(heading()).toBe(target.title);
    expect(bodyText()).toContain("Code location");
    expect(bodyText()).toContain(target.trainingProject?.repo ?? "");
  });

  it("Projects lists every repository in the system", () => {
    renderRoute("/projects", "/projects", <ProjectsPage />);
    for (const project of site.projects) {
      expect(bodyText()).toContain(project.id);
      expect(bodyText()).toContain(project.name);
    }
    expect(bodyText()).toContain("Training ground");
    expect(bodyText()).toContain("Production project");
  });

  it("Progress renders phases, calendar and questions", () => {
    renderRoute("/progress", "/progress", <ProgressPage />);
    expect(bodyText()).toContain("Learning timeline");
    expect(bodyText()).toContain("Phases");
    expect(bodyText()).toContain("Questions");
    expect(document.querySelector("svg rect")).toBeTruthy();
    for (const phase of progress.phases) {
      expect(bodyText()).toContain(phase.name);
    }
    expect(bodyText()).toContain(progress.questions.items[0]!.question.slice(0, 40));
  });

  it("About explains the loop and the content model", () => {
    renderRoute("/about", "/about", <AboutPage />);
    expect(bodyText()).toContain("One day, one commit");
    expect(bodyText()).toContain("docs/{en,zh}/daily/day-NN.md");
    expect(bodyText()).toContain("npm run generate");
  });

  it("Unknown routes fall back to the 404 page", () => {
    renderRoute("/nowhere", "*", <NotFoundPage />);
    expect(bodyText()).toContain("404");
    expect(bodyText()).toContain("No markdown file resolves");
  });

  it("A stale param renders the 404 page instead of crashing", () => {
    renderRoute("/concepts/not-a-real-concept", "/concepts/:id", <ConceptPage />);
    expect(bodyText()).toContain("404");
  });
});

/* ------------------------------------------------------------------ *
 * Bilingual routing: the URL owns the language, storage only remembers.
 * ------------------------------------------------------------------ */

const LANGUAGE_KEY = "agent-lab-language";

/** Mount the real router so guards, legacy redirects and the switch all run. */
async function renderApp(entry: string) {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <App />
    </MemoryRouter>,
  );
  // Document pages are lazy-loaded; wait until a page actually painted.
  await waitFor(() => expect(document.querySelector("h1")).not.toBeNull());
}

const hrefs = () =>
  [...document.querySelectorAll("a")].map((anchor) => anchor.getAttribute("href") ?? "");

describe("language routing", () => {
  beforeEach(() => localStorage.clear());

  it("serves the Chinese tree under /zh", async () => {
    await renderApp("/zh/learn/day/1");
    expect(bodyText()).toContain("Agent 到底是什么");
  });

  it("serves the English source under /en", async () => {
    await renderApp("/en/learn/day/1");
    expect(bodyText()).toContain(days[0]!.title);
  });

  it("keeps links written before the split alive", async () => {
    await renderApp("/learn/day/1");
    expect(bodyText()).toContain(days[0]!.title);
  });

  it("404s an unknown language prefix instead of falling back to English", async () => {
    await renderApp("/fr/learn");
    expect(bodyText()).toContain("./nowhere");
  });

  it("uses the remembered language for a bare /", async () => {
    localStorage.setItem(LANGUAGE_KEY, "zh");
    await renderApp("/");
    expect(bodyText()).toContain("重新把它们造出来");
  });

  it("lets the URL win over the remembered language", async () => {
    localStorage.setItem(LANGUAGE_KEY, "zh");
    await renderApp("/en/about");
    expect(bodyText()).toContain("A public learning record");
  });

  it("switches language without changing the document", async () => {
    await renderApp("/en/concepts/agent-loop");
    expect(hrefs()).toContain("/zh/concepts/agent-loop");
  });

  it("remembers the language the reader clicked", async () => {
    await renderApp("/en/learn/day/1");
    fireEvent.click(document.querySelector('a[lang="zh"]')!);
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe("zh");
    await waitFor(() => expect(bodyText()).toContain("Agent 到底是什么"));
  });

  it("names a missing translation instead of substituting English", async () => {
    await renderApp("/zh/learn/day/3");
    expect(bodyText()).toContain("中文版本尚未完成");
    expect(hrefs()).toContain("/en/learn/day/3");
  });
});

/* ------------------------------------------------------------------ *
 * Document pages resolve inside the requested tree, not "English if lost".
 * ------------------------------------------------------------------ */

describe("translated document pages", () => {
  beforeEach(() => localStorage.clear());

  it("renders a translated concept from the Chinese tree", async () => {
    await renderApp("/zh/concepts/agent-loop");
    expect(bodyText()).toContain("执行循环");
  });

  it("renders a translated experiment from the Chinese tree", async () => {
    await renderApp("/zh/experiments/003-agent-loop");
    expect(bodyText()).toContain("迷你 Agent Loop");
  });

  it("renders a translated comparison from the Chinese tree", async () => {
    await renderApp("/zh/comparisons/custom-agent-vs-langgraph");
    expect(bodyText()).toContain("LangGraph 的对比");
  });

  it("404s an unknown id in either language — no notice without a source", async () => {
    await renderApp("/en/concepts/not-a-concept");
    expect(bodyText()).toContain("./nowhere");
    cleanup();
    await renderApp("/zh/concepts/not-a-concept");
    expect(bodyText()).toContain("./nowhere");
    // the notice is not a substitute for a real 404
    expect(bodyText()).not.toContain("中文版本尚未完成");
  });
});

/* ------------------------------------------------------------------ *
 * A page in one language is that language all the way down — list,
 * titles and chrome alike.
 * ------------------------------------------------------------------ */

describe("pages answer from the requested tree", () => {
  beforeEach(() => localStorage.clear());

  it("lists Chinese day titles on /zh/learn, not the English ones", async () => {
    await renderApp("/zh/learn");
    expect(bodyText()).toContain("LLM API、流式输出与用量统计");
    expect(bodyText()).not.toContain(days[1]!.title);
    // day-03 has no Chinese version, so the Chinese list is one day shorter
    expect(bodyText()).toContain("共 2 天");
  });

  it("shows English day titles on /en/learn", async () => {
    await renderApp("/en/learn");
    expect(bodyText()).toContain(days[1]!.title);
    expect(bodyText()).toContain("3 days");
  });

  it("translates the chrome of the progress page", async () => {
    await renderApp("/zh/progress");
    expect(bodyText()).toContain("学习时间线");
  });

  it("translates the about page intro sentence", async () => {
    await renderApp("/zh/about");
    expect(bodyText()).toContain("个学习日");
  });
});
