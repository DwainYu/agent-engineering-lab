/**
 * The lab ships two complete language trees:
 *
 *   docs/en   canonical technical source
 *   docs/zh   complete Chinese learning / review version
 *
 * A Chinese document is paired with its English source by its stable `id`,
 * never by its file name and never by its position in the tree.
 */

export const LANGUAGES = ["en", "zh"] as const;
export type Language = (typeof LANGUAGES)[number];

/** Language of record. Everything else is derived from it. */
export const SOURCE_LANGUAGE: Language = "en";

/** Languages the engine looks for a translation in. */
export const TRANSLATION_LANGUAGES: Language[] = LANGUAGES.filter(
  (language) => language !== SOURCE_LANGUAGE,
);

/** The language a visitor gets when nothing says otherwise. */
export const DEFAULT_LANGUAGE: Language = SOURCE_LANGUAGE;

/** Key the website uses to persist the reader's choice. */
export const LANGUAGE_STORAGE_KEY = "agent-lab-language";

/** Short labels for the header switch: `EN | 中文`. */
export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "EN",
  zh: "中文",
};

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

export function asLanguage(value: unknown): Language | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  return isLanguage(normalized) ? normalized : undefined;
}
