import { parse as parseYaml } from "yaml";

export interface RawDoc {
  data: Record<string, unknown>;
  body: string;
  /** set when the YAML block could not be parsed at all */
  parseError?: string;
}

const DELIMITER = /^---\s*$/;

/**
 * Split a Markdown file into its YAML frontmatter block and body.
 * Frontmatter is optional in comparison/question notes, required for Day /
 * Concept / Experiment (enforced by the validator, not here).
 */
export function extractFrontmatter(source: string): RawDoc {
  const text = source.replace(/^/, "");
  const lines = text.split(/\r?\n/);

  if (!DELIMITER.test(lines[0] ?? "")) {
    return { data: {}, body: text };
  }

  let end = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (DELIMITER.test(lines[i] ?? "")) {
      end = i;
      break;
    }
  }
  if (end === -1) {
    return {
      data: {},
      body: text,
      parseError: "frontmatter block is never closed with ---",
    };
  }

  const yamlText = lines.slice(1, end).join("\n");
  const body = lines.slice(end + 1).join("\n");

  try {
    const parsed = parseYaml(yamlText);
    if (parsed === null || parsed === undefined) {
      return { data: {}, body };
    }
    if (typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        data: {},
        body,
        parseError: "frontmatter must be a YAML mapping",
      };
    }
    return { data: parsed as Record<string, unknown>, body: body.trim() };
  } catch (error) {
    return {
      data: {},
      body,
      parseError: error instanceof Error ? error.message : String(error),
    };
  }
}

/* ------------------------------------------------------------------ *
 * Coercion helpers — frontmatter is untyped YAML, the site is typed TS.
 * ------------------------------------------------------------------ */

export function asString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

export function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

/** Accepts `a`, `[a, b]`, or a list of maps with a `repo` key. */
export function asStringArray(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  const list = Array.isArray(value) ? value : [value];
  const out: string[] = [];
  for (const item of list) {
    const str = asString(item);
    if (str) out.push(str);
  }
  return out;
}

/** `2026-09-10`, a YAML date object, or a JS Date — always YYYY-MM-DD. */
export function asDate(value: unknown): string | undefined {
  if (value instanceof Date) return toDateISO(value);
  if (typeof value === "string") {
    const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return undefined;
}

export function toDateISO(value: Date): string {
  const y = value.getUTCFullYear();
  const m = `${value.getUTCMonth() + 1}`.padStart(2, "0");
  const d = `${value.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface ProjectRef {
  repo: string;
  path?: string;
}

export function asProjectRef(value: unknown): ProjectRef | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") {
    return value.trim() ? { repo: value.trim() } : undefined;
  }
  if (typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const repo = asString(record.repo);
  if (!repo) return undefined;
  const path = asString(record.path);
  return path ? { repo, path } : { repo };
}

/** Level-2 (`## `) headings of a markdown body, in document order. */
export function h2Headings(body: string): string[] {
  return body
    .split(/\r?\n/)
    .filter((line) => /^##\s+\S/.test(line))
    .map((line) => line.replace(/^##\s+/, "").trim());
}
