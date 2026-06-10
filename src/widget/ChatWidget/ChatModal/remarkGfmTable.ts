import type { Plugin } from "unified";
import { gfmTable } from "micromark-extension-gfm-table";
import { gfmTableFromMarkdown } from "mdast-util-gfm-table";

interface ProcessorData {
  micromarkExtensions?: unknown[];
  fromMarkdownExtensions?: unknown[];
}

// Minimal stand-in for remark-gfm that enables ONLY GFM tables. remark-gfm also
// pulls in autolink-literal, strikethrough, task-list and footnote extensions
// plus a full markdown *serializer* (mdast-util-to-markdown + markdown-table)
// that react-markdown never exercises — all dead weight in the lazy chat chunk.
// Tables are the only GFM feature the renderer actually styles (see the table /
// thead / th / td components in ChatMessages), so we wire up just that one.
export const remarkGfmTable: Plugin<[]> = function () {
  const data = this.data() as ProcessorData;
  // gfmTable / gfmTableFromMarkdown are factories — call them to get the actual
  // micromark/mdast extensions.
  (data.micromarkExtensions ??= []).push(gfmTable());
  (data.fromMarkdownExtensions ??= []).push(gfmTableFromMarkdown());
};
