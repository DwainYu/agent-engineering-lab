#!/usr/bin/env tsx
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadContent } from "./lib/load.js";
import { buildProgress } from "./lib/progress.js";
import { summarize, validateContent } from "./lib/validate.js";

const bundle = loadContent();
const { errors } = summarize([...bundle.issues, ...validateContent(bundle)]);

if (errors.length > 0) {
  console.error(
    `Cannot generate progress: ${errors.length} content error(s).\nRun \`npm run validate\` for details.`,
  );
  process.exit(1);
}

const version = (
  JSON.parse(readFileSync(join(bundle.root, "package.json"), "utf8")) as {
    version?: string;
  }
).version;

const today = new Date().toISOString().slice(0, 10);
const progress = buildProgress(bundle, { version: version ?? "0.0.0", today });

function write(relative: string, data: unknown): void {
  const file = join(bundle.root, relative);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`wrote ${relative}`);
}

// repo-level state (§8) — human-readable, committed
write("data/progress.json", progress);

// build-time content data consumed by React (§25) — never scanned at runtime
const generated = "web/src/data/generated";
write(`${generated}/progress.json`, progress);
write(`${generated}/days.json`, bundle.days);
write(`${generated}/concepts.json`, bundle.concepts);
write(`${generated}/experiments.json`, bundle.experiments);
write(`${generated}/comparisons.json`, bundle.comparisons);
write(`${generated}/site.json`, bundle.site);

console.log(
  `\n${progress.summary.completedDays}/${progress.summary.totalDays} days complete ` +
    `(${progress.summary.completionRate}%).`,
);
