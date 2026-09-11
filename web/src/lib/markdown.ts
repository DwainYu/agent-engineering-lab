interface HastNode {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

/**
 * Day notes use `- [x]` checklists as a self-test. They are records, not
 * controls, so the rendered checkbox must not be clickable (§22).
 */
function disableCheckboxes(node: HastNode): void {
  if (node.type === "element" && node.tagName === "input") {
    node.properties = { ...node.properties, disabled: true };
  }
  for (const child of node.children ?? []) {
    disableCheckboxes(child);
  }
}

export function rehypeCheckboxDisabled() {
  return (tree: unknown): void => {
    disableCheckboxes(tree as HastNode);
  };
}

/* ------------------------------------------------------------------ *
 * Chinese assistance blocks
 *
 * `> **中文理解**` is the only marker. Recognition happens on the Markdown
 * AST (a blockquote whose first paragraph is that strong text), not by
 * scanning rendered text, so a note that merely mentions the words cannot be
 * mistaken for an assistance block.
 * ------------------------------------------------------------------ */

export const ASSIST_CLASS = "zh-assist";
const DEEP_MARKER = "中文深入理解";
const BRIEF_MARKER = "中文理解";

function nodeText(node: HastNode): string {
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map(nodeText).join("");
}

/** Marker paragraph plus mode, when the blockquote opens with one. */
function assistMarkerOf(
  node: HastNode,
): { mode: "deep" | "brief"; marker: HastNode } | undefined {
  /* hast keeps the newlines between blocks as text nodes, so the first element
     child is the paragraph — not necessarily children[0]. */
  const paragraph = (node.children ?? []).find((child) => child.type === "element");
  if (paragraph?.tagName !== "p") return undefined;
  const strong = (paragraph.children ?? []).find((child) => child.type === "element");
  if (strong?.tagName !== "strong") return undefined;
  const text = nodeText(strong).trim();
  if (text === DEEP_MARKER) return { mode: "deep", marker: paragraph };
  if (text === BRIEF_MARKER) return { mode: "brief", marker: paragraph };
  return undefined;
}

function classList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.trim() !== "") return value.trim().split(/\s+/);
  return [];
}

function markAssistBlocks(node: HastNode): void {
  if (node.type === "element" && node.tagName === "blockquote") {
    const found = assistMarkerOf(node);
    if (found) {
      const { mode, marker } = found;
      /* The marker paragraph only identifies the block; the component draws its
         own label, so leaving it in would print 中文理解 twice. */
      node.children = (node.children ?? []).filter((child) => child !== marker);
      // String, not array: hast-util-to-jsx-runtime passes the value straight
      // through, and the component matches on the class name.
      node.properties = {
        ...node.properties,
        className: [
          ...classList(node.properties?.className),
          ASSIST_CLASS,
          `${ASSIST_CLASS}--${mode}`,
        ].join(" "),
      };
    }
  }
  for (const child of node.children ?? []) {
    markAssistBlocks(child);
  }
}

export function rehypeChineseAssist() {
  return (tree: unknown): void => {
    markAssistBlocks(tree as HastNode);
  };
}

const ASSIST_LINE = /^\s{0,3}>\s*\*\*(中文理解|中文深入理解)\*\*/;

/**
 * Drop whole assistance blockquotes. Cards and previews stay English-first even
 * when the reader's preferred mode is Chinese assistance.
 */
export function stripAssist(markdown: string): string {
  const kept: string[] = [];
  let dropping = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (ASSIST_LINE.test(line)) {
      dropping = true;
      continue;
    }
    if (dropping) {
      if (/^\s{0,3}>/.test(line)) continue;
      if (line.trim() === "") {
        dropping = false;
        continue;
      }
      dropping = false;
    }
    kept.push(line);
  }
  return kept.join("\n");
}

/**
 * Plain-text summary of a markdown body for cards and search-less previews:
 * drops code fences, heading marks, list bullets and Chinese assistance.
 */
export function excerpt(markdown: string, limit = 240): string {
  const text = stripAssist(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^---[\s\S]*?---/m, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+(\[[ x]\]\s+)?/gm, "")
    .replace(/[*_`>~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length <= limit ? text : `${text.slice(0, limit).trimEnd()}…`;
}
