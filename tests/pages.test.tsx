// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
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

/** Render one route the way the router would, including its params. */
function renderRoute(entry: string, pattern: string, element: ReactElement) {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path={pattern} element={element} />
      </Routes>
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
    expect(bodyText()).toContain("Timeline");
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
    expect(bodyText()).toContain("docs/daily/day-NN.md");
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
