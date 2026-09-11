// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
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
import { MarkdownContent } from "../web/src/components/learning/MarkdownContent";
import { Layout } from "../web/src/components/layout/Layout";
import { excerpt } from "../web/src/lib/markdown";
import { ReadingModeProvider } from "../web/src/components/layout/ReadingModeProvider";
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
/** Render one route the way the router would — inside the global providers. */
function renderRoute(entry: string, pattern: string, element: ReactElement) {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <ReadingModeProvider>
        <Routes>
          <Route path={pattern} element={element} />
        </Routes>
      </ReadingModeProvider>
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

/* ------------------------------------------------------------------ *
 * Reading mode: English is the content, assistance is revealed on demand.
 * ------------------------------------------------------------------ */

const STORAGE_KEY = "lab-reading-mode";

const ASSIST_MD = `## What I Learned

The Agent Loop is an iterative execution cycle.

> **中文理解**
>
> Agent Loop 可以理解为：模型决策 → 调用工具 → 获得结果 → 再次决策。

> Not assistance, just a quote.
`;

/** Cards, not the page sidebars, which are \`<aside>\` too. */
const assistCards = () =>
  [...document.querySelectorAll('aside[lang="zh-CN"]')].map(
    (node) => node.textContent ?? "",
  );

function renderMarkdown(content: string) {
  render(
    <ReadingModeProvider>
      <MarkdownContent content={content} />
    </ReadingModeProvider>,
  );
}

function renderSiteRoute(entry: string, pattern: string, element: ReactElement) {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <ReadingModeProvider>
        <Layout>
          <Routes>
            <Route path={pattern} element={element} />
          </Routes>
        </Layout>
      </ReadingModeProvider>
    </MemoryRouter>,
  );
}

const headerButtons = () =>
  [...document.querySelectorAll("header button")].map((node) => node.textContent);

const clickHeaderButton = (label: string) => {
  const node = [...document.querySelectorAll("header button")].find(
    (button) => button.textContent === label,
  );
  if (!node) throw new Error(`no header button labelled ${label}`);
  fireEvent.click(node);
};

describe("chinese assistance rendering", () => {
  beforeEach(() => localStorage.clear());

  it("stays hidden in the default English mode", () => {
    renderMarkdown(ASSIST_MD);
    expect(assistCards()).toEqual([]);
    expect(bodyText()).toContain("iterative execution cycle");
    expect(bodyText()).not.toContain("模型决策");
  });

  it("reveals the block as its own labelled card", () => {
    localStorage.setItem(STORAGE_KEY, "assist");
    renderMarkdown(ASSIST_MD);
    expect(assistCards()).toHaveLength(1);
    expect(assistCards()[0]).toContain("中文理解");
    expect(assistCards()[0]).toContain("模型决策");
    // the marker paragraph identifies the block; it must not print twice
    expect(bodyText().split("中文理解").length - 1).toBe(1);
  });

  it("labels a deep block as deep", () => {
    localStorage.setItem(STORAGE_KEY, "assist");
    renderMarkdown("> **中文深入理解**\n>\n> 当前 LLM 的工作桌面。\n");
    expect(assistCards()[0]).toContain("中文深入理解");
    expect(assistCards()[0]).toContain("工作桌面");
  });

  it("leaves ordinary blockquotes untouched", () => {
    localStorage.setItem(STORAGE_KEY, "assist");
    renderMarkdown(ASSIST_MD);
    const quotes = [...document.querySelectorAll("blockquote")];
    expect(quotes).toHaveLength(1);
    expect(quotes[0]?.textContent).toContain("just a quote");
  });

  it("keeps assistance out of card excerpts", () => {
    const day = days.find((item) => item.assist !== undefined);
    expect(day?.day).toBe(1);
    const text = excerpt(day!.body);
    expect(text).toContain("The difference between a");
    expect(text).not.toContain("中文理解");
    expect(text).not.toContain("控制流在谁手上");
  });
});

describe("reading mode switch", () => {
  beforeEach(() => localStorage.clear());

  it("offers both modes on a document that has assistance", () => {
    renderSiteRoute("/learn/day/1", "/learn/day/:day", <DayPage />);
    expect(headerButtons()).toContain("EN");
    expect(headerButtons()).toContain("中文辅助");
  });

  it("is absent when the document has nothing to reveal", () => {
    renderSiteRoute("/learn/day/2", "/learn/day/:day", <DayPage />);
    expect(headerButtons()).not.toContain("中文辅助");
    expect(assistCards()).toEqual([]);
  });

  it("toggles the real Day 01 note and remembers the choice", () => {
    renderSiteRoute("/learn/day/1", "/learn/day/:day", <DayPage />);
    expect(assistCards()).toEqual([]);
    expect(bodyText()).toContain("control flow");

    clickHeaderButton("中文辅助");
    expect(assistCards().length).toBeGreaterThan(0);
    expect(bodyText()).toContain("控制流在谁手上");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("assist");

    clickHeaderButton("EN");
    expect(assistCards()).toEqual([]);
    expect(bodyText()).toContain("control flow");
  });

  it("works on concept pages too", () => {
    localStorage.setItem(STORAGE_KEY, "assist");
    renderSiteRoute("/concepts/agent-loop", "/concepts/:id", <ConceptPage />);
    expect(assistCards().join("\n")).toContain("难点在退出条件");
    expect(assistCards().join("\n")).toContain("模型没有状态");
    cleanup();
    renderSiteRoute("/concepts/agent", "/concepts/:id", <ConceptPage />);
    expect(headerButtons()).not.toContain("中文辅助");
  });
});
