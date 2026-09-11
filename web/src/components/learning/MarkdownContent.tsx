import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Options } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import {
  ASSIST_CLASS,
  rehypeCheckboxDisabled,
  rehypeChineseAssist,
} from "../../lib/markdown";
import { ChineseAssistBlock } from "./ChineseAssistBlock";

const remarkPlugins: Options["remarkPlugins"] = [remarkGfm];
/* Bundling every highlight.js grammar costs ~400 kB of the JS payload for
   grammars no learning note uses, so ship only the ones this site contains. */
const LANGUAGES = ["bash", "json", "markdown", "python", "typescript", "yaml"];

const rehypePlugins: Options["rehypePlugins"] = [
  [rehypeHighlight, { subset: LANGUAGES }],
  rehypeCheckboxDisabled,
  rehypeChineseAssist,
];

/**
 * Blockquotes split in two: an assistance block becomes its own component, any
 * other quote keeps the plain Markdown styling.
 */
function MarkdownBlockquote({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  if (className?.includes(ASSIST_CLASS)) {
    return (
      <ChineseAssistBlock deep={className.includes(`${ASSIST_CLASS}--deep`)}>
        {children}
      </ChineseAssistBlock>
    );
  }
  return <blockquote className={className}>{children}</blockquote>;
}

const components: Options["components"] = { blockquote: MarkdownBlockquote };

/** Rendered Markdown with GitHub flavour, syntax highlighting and 850px measure. */
export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
