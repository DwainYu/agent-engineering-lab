#!/usr/bin/env tsx
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadContent } from "./lib/load.js";
import { buildProgress } from "./lib/progress.js";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, LANGUAGES } from "./lib/language.js";
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

// one bundle per language tree: the site never falls back between them,
// it renders the tree the URL asked for.
for (const language of LANGUAGES) {
  write(`${generated}/content.${language}.json`, bundle.byLanguage[language]);
}

// translation drift: one row per English document.
write(`${generated}/sync.json`, {
  languages: LANGUAGES,
  defaultLanguage: DEFAULT_LANGUAGE,
  storageKey: LANGUAGE_STORAGE_KEY,
  counts: progress.summary.translation,
  documents: bundle.translations,
});

write(`${generated}/progress.json`, progress);
write(`${generated}/site.json`, bundle.site);

console.log(
  `\n${progress.summary.completedDays}/${progress.summary.totalDays} days complete ` +
    `(${progress.summary.completionRate}%). ` +
    `translations: ${progress.summary.translation.synced} synced, ` +
    `${progress.summary.translation.outdated} outdated, ` +
    `${progress.summary.translation.missing} missing.`,
);
