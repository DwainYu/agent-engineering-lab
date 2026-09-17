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

/**
 * Plain-text summary of a markdown body for cards and search-less previews:
 * drops code fences, heading marks and list bullets.
 *
 * The frontmatter block is already stripped by the loader, so a simple
 * leading-anchor match is enough — no `m` flag needed and no risk of eating
 * content between two horizontal rules later in the body.
 */
export function excerpt(markdown: string, limit = 240): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^---[\s\S]*?^---\s*\n/m, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+(\[[ x]\]\s+)?/gm, "")
    .replace(/[*_`>~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length <= limit ? text : `${text.slice(0, limit).trimEnd()}…`;
}
