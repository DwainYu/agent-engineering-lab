import { describe, expect, it } from "vitest";
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  SOURCE_LANGUAGE,
  TRANSLATION_LANGUAGES,
  asLanguage,
  isLanguage,
} from "../scripts/lib/language.js";
import {
  countTranslations,
  emptyTranslationMap,
  pairBy,
  translationRef,
  translationStatus,
} from "../scripts/lib/translation.js";
import type { SyncDocument } from "../scripts/lib/types.js";
import { buildProgress } from "../scripts/lib/progress.js";
import { loadContent } from "../scripts/lib/load.js";
import { validateContent } from "../scripts/lib/validate.js";
import {
  langHref,
  languageFromPath,
  withLanguage,
} from "../web/src/lib/language.js";

/* ------------------------------------------------------------------ *
 * The language vocabulary
 * ------------------------------------------------------------------ */

describe("language vocabulary", () => {
  it("treats English as the source and Chinese as the only translation", () => {
    expect(LANGUAGES).toEqual(["en", "zh"]);
    expect(SOURCE_LANGUAGE).toBe("en");
    expect(DEFAULT_LANGUAGE).toBe(SOURCE_LANGUAGE);
    expect(TRANSLATION_LANGUAGES).toEqual(["zh"]);
  });

  it("narrows unknown values instead of trusting a cast", () => {
    expect(isLanguage("zh")).toBe(true);
    expect(isLanguage("de")).toBe(false);
    expect(asLanguage("en")).toBe("en");
    // frontmatter is authored by hand, so casing and stray space are forgiven;
    // a URL prefix is not — `languageFromPath` stays case-sensitive.
    expect(asLanguage(" EN ")).toBe("en");
    expect(asLanguage("En")).toBe("en");
    expect(asLanguage("de")).toBeUndefined();
    expect(asLanguage(undefined)).toBeUndefined();
    expect(asLanguage(42)).toBeUndefined();
  });
});

/* ------------------------------------------------------------------ *
 * Paths carry the language; the router parses and rewrites them.
 * ------------------------------------------------------------------ */

describe("language in the path", () => {
  it("reads the prefix only when it is a whole segment", () => {
    expect(languageFromPath("/zh")).toBe("zh");
    expect(languageFromPath("/en/concepts/agent-loop")).toBe("en");
    expect(languageFromPath("/zhishu")).toBeUndefined();
    expect(languageFromPath("/learn/day/1")).toBeUndefined();
  });

  it("rewrites the prefix and keeps the document id", () => {
    expect(withLanguage("/en/learn/day/6", "zh")).toBe("/zh/learn/day/6");
    expect(withLanguage("/zh/concepts/agent", "en")).toBe("/en/concepts/agent");
  });

  it("adds a prefix to a legacy path instead of stacking one", () => {
    expect(withLanguage("/learn/day/1", "zh")).toBe("/zh/learn/day/1");
    expect(withLanguage("/", "zh")).toBe("/zh");
    expect(withLanguage("", "en")).toBe("/en");
  });

  it("builds hrefs that tolerate a leading and trailing slash", () => {
    expect(langHref("zh")).toBe("/zh");
    expect(langHref("zh", "concepts/agent")).toBe("/zh/concepts/agent");
    expect(langHref("zh", "/concepts/agent/")).toBe("/zh/concepts/agent");
  });
});

/* ------------------------------------------------------------------ *
 * Revision tracking is the entire translation model.
 * ------------------------------------------------------------------ */

describe("translation status", () => {
  const source = { id: "day-01", path: "docs/en/daily/day-01.md", revision: 4 };

  it("is missing when there is no target document", () => {
    expect(translationStatus(source, undefined)).toBe("missing");
  });

  it("is synced when the revisions agree", () => {
    expect(
      translationStatus(source, { id: "day-01", path: "docs/zh/daily/day-01.md", sourceRevision: 4 }),
    ).toBe("synced");
  });

  it("is outdated when the source moved on or the base is unknown", () => {
    expect(
      translationStatus(source, { id: "day-01", path: "x", sourceRevision: 3 }),
    ).toBe("outdated");
    expect(translationStatus(source, { id: "day-01", path: "x" })).toBe("outdated");
    expect(translationStatus(undefined, { id: "day-01", path: "x", sourceRevision: 4 })).toBe(
      "missing",
    );
  });

  it("carries the target path so the UI can link to it", () => {
    const ref = translationRef(source, {
      id: "day-01",
      path: "docs/zh/daily/day-01.md",
      sourceRevision: 4,
    });
    expect(ref).toEqual({ status: "synced", path: "docs/zh/daily/day-01.md", sourceRevision: 4 });
    expect(translationRef(source, undefined)).toEqual({ status: "missing" });
  });

  it("pairs by id and reports a target with no source", () => {
    const { entries, orphans } = pairBy(
      [source, { id: "day-02", path: "b", revision: 1 }],
      [
        { id: "day-01", path: "zh/a", sourceRevision: 4 },
        { id: "ghost", path: "zh/c" },
      ],
      (s, target) => ({ translation: { zh: translationRef(s, target) } }),
    );
    expect(entries).toHaveLength(2);
    expect(entries[0]!.translation.zh.status).toBe("synced");
    expect(entries[1]!.translation.zh.status).toBe("missing");
    expect(orphans.map((orphan) => orphan.id)).toEqual(["ghost"]);
  });

  it("counts each document once, by its first translation", () => {
    const documents: SyncDocument[] = [
      { id: "a", kind: "day", language: "en", revision: 1, path: "a", translation: { zh: { status: "synced" } } },
      { id: "b", kind: "day", language: "en", revision: 1, path: "b", translation: { zh: { status: "outdated" } } },
      { id: "c", kind: "day", language: "en", revision: 1, path: "c", translation: emptyTranslationMap() },
    ];
    expect(countTranslations(documents)).toEqual({ synced: 1, outdated: 1, missing: 1, total: 3 });
  });
});

/* ------------------------------------------------------------------ *
 * The real repository, end to end.
 * ------------------------------------------------------------------ */

const bundle = loadContent();
const en = bundle.byLanguage.en;
const zh = bundle.byLanguage.zh;

describe("the bilingual repository", () => {
  it("loads one tree per language", () => {
    expect(bundle.languages).toEqual(LANGUAGES);
    expect(Object.keys(bundle.byLanguage).sort()).toEqual(["en", "zh"]);
    expect(en.days.length).toBeGreaterThan(zh.days.length);
    expect(zh.concepts.length).toBe(en.concepts.length);
  });

  it("pairs a Chinese document with its English source by id, not filename", () => {
    // The proof of id-based pairing: the path recorded on the English side
    // resolves, inside the Chinese tree, to the entry carrying the same id.
    const zhById = new Map(zh.concepts.map((concept) => [concept.id, concept]));
    for (const concept of en.concepts) {
      // TranslationMap is partial by type; `synced` is asserted just below.
const ref = concept.translation.zh!;
      expect(ref.status, concept.id).toBe("synced");
      const partner = zhById.get(concept.id);
      expect(partner, concept.id).toBeDefined();
      expect(ref.path).toBe(partner!.path);
      expect(partner!.path).toMatch(/^docs\/zh\//);
      // terms fixed by docs/glossary.yml may keep an English title; the prose
      // inside may not.
      expect(partner!.body).not.toBe(concept.body);
    }
  });

  it("marks a document without a Chinese version as missing", () => {
    const untranslated = en.days.find((day) => day.translation.zh?.status === "missing");
    expect(untranslated?.day).toBe(3);
    expect(bundle.translations.find((doc) => doc.id === untranslated?.id)).toBeDefined();
  });

  it("refuses a translation whose source does not exist", () => {
    const ids = new Set(en.days.map((day) => day.id));
    for (const day of zh.days) expect(ids.has(day.id), day.id).toBe(true);
  });

  it("holds the repository together — no dangling ids or stale revisions", () => {
    expect(validateContent(bundle)).toEqual([]);
  });

  it("keeps every Chinese body actually Chinese", () => {
    for (const concept of zh.concepts) {
      expect(concept.body).toMatch(/[\u4e00-\u9fff]/);
    }
  });

  it("reports per-language progress and the sync ledger", () => {
    const progress = buildProgress(bundle, { version: "test", today: "2026-09-17" });
    const { summary } = progress;
    expect(summary.languages.en.totalDays).toBe(en.days.length);
    expect(summary.languages.zh.totalDays).toBe(zh.days.length);
    expect(summary.translation.total).toBe(bundle.translations.length);
    expect(summary.translation.missing).toBeGreaterThan(0);
    expect(summary.translation.synced).toBeGreaterThan(0);
    expect(summary.translation.outdated).toBe(0);
  });

  it("gives each day row both language paths", () => {
    const progress = buildProgress(bundle, { version: "test", today: "2026-09-17" });
    const first = progress.days.find((row) => row.id === "day-01");
    expect(first?.english.path).toMatch(/^docs\/en\//);
    expect(first?.chinese?.path).toMatch(/^docs\/zh\//);
    expect(first?.chinese?.status).toBe("synced");
  });
});
