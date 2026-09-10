#!/usr/bin/env tsx
import { loadContent } from "./lib/load.js";
import { summarize, validateContent } from "./lib/validate.js";

const bundle = loadContent();
const issues = [...bundle.issues, ...validateContent(bundle)];
const { errors, warnings } = summarize(issues);

const counts = {
  days: bundle.days.length,
  concepts: bundle.concepts.length,
  experiments: bundle.experiments.length,
  comparisons: bundle.comparisons.length,
  questions: bundle.questions.asked,
};

console.log(
  `Checked ${Object.values(counts).reduce((a, b) => a + b, 0)} content records ` +
    `(days ${counts.days}, concepts ${counts.concepts}, experiments ${counts.experiments}, ` +
    `comparisons ${counts.comparisons}, questions ${counts.questions})`,
);

if (warnings.length > 0) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const warning of warnings) {
    console.log(`  ~ ${warning.file}\n      ${warning.message}`);
  }
}

if (errors.length > 0) {
  console.error(`\nContent validation failed:\n`);
  for (const error of errors) {
    console.error(`${error.file}\n${error.message}\n`);
  }
  process.exit(1);
}

console.log("Content validation passed.");
