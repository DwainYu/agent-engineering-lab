import type {
  SyncDocument,
  TranslationCounts,
  TranslationMap,
  TranslationRef,
  TranslationStatus,
} from "./types.js";

/** Anything that owns a canonical revision — the English side of a document. */
export interface Revisioned {
  id: string;
  path: string;
  revision: number;
}

/** Anything that claims to be a translation of a revision. */
export interface Translated {
  id: string;
  path: string;
  sourceRevision?: number;
}

/**
 * The whole translation model: compare the revision the translation was made
 * from against the revision the source has now.
 *
 * no target document      → `missing`
 * equal revisions         → `synced`
 * anything else           → `outdated`
 */
export function translationStatus(
  source: Revisioned | undefined,
  target: Translated | undefined,
): TranslationStatus {
  if (!source) return "missing";
  if (!target) return "missing";
  if (target.sourceRevision === undefined) return "outdated";
  return target.sourceRevision === source.revision ? "synced" : "outdated";
}

export function translationRef(
  source: Revisioned | undefined,
  target: Translated | undefined,
): TranslationRef {
  const ref: TranslationRef = { status: translationStatus(source, target) };
  if (target) {
    ref.path = target.path;
    if (target.sourceRevision !== undefined) ref.sourceRevision = target.sourceRevision;
  }
  return ref;
}

export function emptyTranslationMap(): TranslationMap {
  const map: TranslationMap = {};
  for (const lang of ["en", "zh"] as const) {
    if (lang === "en") continue;
    map[lang] = { status: "missing" };
  }
  return map;
}

/**
 * Pair two language trees by stable id.
 *
 * `sources` is the canonical tree: every entry of it is emitted. `targets`
 * supplies identity fields plus the display strings and body that differ per
 * language. The result keeps both trees in document order.
 */
export function pairBy<
  S extends Revisioned,
  T extends Translated,
  R extends { translation: TranslationMap },
>(
  sources: S[],
  targets: T[],
  build: (source: S, target: T | undefined) => R,
): {
  entries: R[];
  orphans: T[];
} {
  const targetById = new Map<string, T>(targets.map((target) => [target.id, target]));
  const sourceIds = new Set(sources.map((source) => source.id));

  const entries = sources.map((source) => build(source, targetById.get(source.id)));
  const orphans = targets.filter((target) => !sourceIds.has(target.id));
  return { entries, orphans };
}

export function countTranslations(documents: SyncDocument[]): TranslationCounts {
  const counts: TranslationCounts = { synced: 0, outdated: 0, missing: 0, total: 0 };
  for (const document of documents) {
    counts.total += 1;
    const first = document.translation["zh"];
    if (!first || first.status === "missing") counts.missing += 1;
    else if (first.status === "outdated") counts.outdated += 1;
    else counts.synced += 1;
  }
  return counts;
}

export const TRANSLATION_STATUSES: TranslationStatus[] = [
  "synced",
  "outdated",
  "missing",
];
