#!/usr/bin/env tsx
import { loadContent } from "./lib/load.js";
import { LANGUAGES } from "./lib/language.js";
import { countTranslations } from "./lib/translation.js";
import { summarize, validateContent } from "./lib/validate.js";

const bundle = loadContent();
const issues = [...bundle.issues, ...validateContent(bundle)];
const { errors, warnings } = summarize(issues);

const counts = LANGUAGES.map((language) => {
  const tree = bundle.byLanguage[language];
  return {
    language,
    days: tree.days.length,
    concepts: tree.concepts.length,
    experiments: tree.experiments.length,
    comparisons: tree.comparisons.length,
    questions: tree.questions.asked,
  };
});

const total = counts.reduce(
  (sum, entry) => sum + entry.days + entry.concepts + entry.experiments + entry.comparisons + entry.questions,
0,
);

console.log(
  `Checked ${total} content records ` +
    counts
      .map(
        (entry) =>
          `${entry.language}: days ${entry.days}, concepts ${entry.concepts}, ` +
          `experiments ${entry.experiments}, comparisons ${entry.comparisons}, ` +
          `questions ${entry.questions}`,
      )
      .join(" | "),
);

const translation = countTranslations(bundle.translations);
console.log(
  `Translations: ${translation.synced} synced · ` +
    `${translation.outdated} outdated · ${translation.missing} missing ` +
    `(of ${translation.total} English documents)`,
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
