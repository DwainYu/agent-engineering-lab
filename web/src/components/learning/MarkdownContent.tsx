import ReactMarkdown from "react-markdown";
import type { Options } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { rehypeCheckboxDisabled } from "../../lib/markdown";

const remarkPlugins: Options["remarkPlugins"] = [remarkGfm];
/* Bundling every highlight.js grammar costs ~400 kB of the JS payload for
   grammars no learning note uses, so ship only the ones this site contains. */
const LANGUAGES = ["bash", "json", "markdown", "python", "typescript", "yaml"];

const rehypePlugins: Options["rehypePlugins"] = [
  [rehypeHighlight, { subset: LANGUAGES }],
  rehypeCheckboxDisabled,
];

/** Rendered Markdown with GitHub flavour, syntax highlighting and 850px measure. */
export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
