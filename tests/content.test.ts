import { describe, expect, it } from "vitest";
import { extractFrontmatter } from "../scripts/lib/frontmatter.js";
import { parseSource, toConceptEntry, toDayEntry } from "../scripts/lib/entries.js";
import { loadContent } from "../scripts/lib/load.js";
import { buildProgress } from "../scripts/lib/progress.js";
import { validateContent } from "../scripts/lib/validate.js";

const DAY = `---
day: 7
title: Retry logic in the runtime
date: 2026-09-16
status: completed
phase: runtime
topics:
  - retries
  - backoff
concepts:
  - agent-loop
experiment:
  - "013"
training_project:
  repo: tft-agent-set18
  path: agent/retry.py
---

## Today's Goal

x

## What I Learned

x

## What I Didn't Understand

x

## Experiment

x

## My Own Explanation

x

## Key Takeaways

x

## Next

x
`;

function issuesOf(source: string, mutate?: (doc: Record<string, unknown>) => void) {
  const parsed = parseSource("docs/daily/day-07.md", source);
  if (mutate) mutate(parsed.data);
  const issues: ReturnType<typeof loadContent>["issues"] = [];
  toDayEntry(parsed, issues);
  return issues;
}

describe("frontmatter", () => {
  it("splits the YAML block from the body", () => {
    const doc = extractFrontmatter(DAY);
    expect(doc.data.day).toBe(7);
    expect(doc.body).toContain("## Today's Goal");
    expect(doc.parseError).toBeUndefined();
  });

  it("reports broken YAML instead of pretending there is no frontmatter", () => {
    const doc = extractFrontmatter('---\nday: 3\nsummary: "unterminated\n---\nbody\n');
    expect(doc.parseError).toBeTruthy();
  });

  it("treats a file without a leading --- as body-only", () => {
    const doc = extractFrontmatter("# Just a heading\n");
    expect(doc.data).toEqual({});
    expect(doc.body).toContain("# Just a heading");
  });
});

describe("entry parsing", () => {
  it("accepts a well-formed completed day", () => {
    expect(issuesOf(DAY)).toEqual([]);
  });

  it("names the missing field when frontmatter is incomplete", () => {
    const issues = issuesOf(DAY, (data) => delete data.phase);
    expect(issues.map((issue) => issue.message)).toContain("Missing field: phase");
  });

  it("rejects an unknown status", () => {
    const issues = issuesOf(DAY, (data) => {
      data.status = "almost-there";
    });
    expect(issues.some((issue) => issue.message.includes("status"))).toBe(true);
  });

  it("defaults concept progress from status when the field is absent", () => {
    const issues: ReturnType<typeof loadContent>["issues"] = [];
    const concept = toConceptEntry(
      parseSource(
        "docs/concepts/x.md",
        "---\nid: x\ntitle: X\ncategory: runtime\nstatus: learning\n---\n\nbody\n",
      ),
      issues,
    );
    expect(concept?.progress).toBe(50);
    expect(issues).toEqual([]);
  });
});

describe("validation", () => {
  it("requires every section in a completed day", () => {
    const source = DAY.replace("## Key Takeaways\n\nx\n", "");
    const bundle = loadContent();
    bundle.days = [
      toDayEntry(parseSource("docs/daily/day-07.md", source), bundle.issues)!,
    ];
    const issues = validateContent(bundle).filter(
      (issue) => issue.file === "docs/daily/day-07.md",
    );
    const text = issues.map((issue) => issue.message).join("\n");
    expect(text).toContain('requires the section "## Key Takeaways"');
    expect(text).not.toContain('requires the section "## Experiment"');
  });

  it("flags a day number that does not match its filename", () => {
    const bundle = loadContent();
    const entry = toDayEntry(
      parseSource("docs/daily/day-07.md", DAY.replace("day: 7", "day: 9")),
      bundle.issues,
    )!;
    bundle.days = [entry];
    const issues = validateContent(bundle).filter((issue) =>
      issue.message.includes("does not match file name"),
    );
    expect(issues).toHaveLength(1);
  });

  it("flags dangling concept and experiment references", () => {
    const bundle = loadContent();
    bundle.days = [toDayEntry(parseSource("docs/daily/day-07.md", DAY), bundle.issues)!];
    bundle.concepts = [];
    bundle.experiments = [];
    const messages = validateContent(bundle)
      .filter((issue) => issue.file === "docs/daily/day-07.md")
      .map((issue) => issue.message);
    expect(messages.join("\n")).toContain("agent-loop");
    expect(messages.join("\n")).toContain("013");
  });
});

describe("progress generation", () => {
  const bundle = loadContent();
  const progress = buildProgress(bundle, { version: "test", today: "2026-09-17" });

  it("counts days by status and derives the completion rate", () => {
    const { summary } = progress;
    expect(summary.totalDays).toBeGreaterThanOrEqual(bundle.days.length);
    expect(summary.completedDays).toBe(
      bundle.days.filter((d) => d.status === "completed").length,
    );
    expect(summary.completionRate).toBe(
      Math.round((summary.completedDays / summary.totalDays) * 100),
    );
    expect(summary.currentDay).toBe(
      Math.max(
        0,
        ...bundle.days.filter((d) => d.status === "completed").map((d) => d.day),
      ),
    );
  });

  it("reports the current day as the latest completed one", () => {
    expect(progress.summary.currentDay).toBeGreaterThan(0);
    expect(progress.summary.currentDay).toBeLessThanOrEqual(progress.summary.totalDays);
  });

  it("aggregates phases and never divides by zero", () => {
    expect(progress.phases.length).toBeGreaterThan(0);
    for (const phase of progress.phases) {
      expect(phase.progress).toBeGreaterThanOrEqual(0);
      expect(phase.progress).toBeLessThanOrEqual(100);
    }
  });

  it("links content back to the training and production repositories", () => {
    const training = progress.summary.projects.find(
      (item) => item.id === "tft-agent-set18",
    );
    expect(training).toBeDefined();
    expect(training!.days).toBeGreaterThan(0);
    expect(training!.experiments).toBeGreaterThan(0);
    expect(progress.summary.questionsAsked).toBe(bundle.questions.asked);
  });

  it("keeps the generated JSON in sync with the markdown", async () => {
    const { readFile } = await import("node:fs/promises");
    const generated = JSON.parse(
      await readFile("web/src/data/generated/progress.json", "utf8"),
    ) as ReturnType<typeof buildProgress>;
    expect(generated.summary).toEqual(progress.summary);
  });
});
