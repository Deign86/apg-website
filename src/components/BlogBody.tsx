import React from 'react';
import { RichText } from './RichText';

interface BlogBodyProps {
  /** Article body as written in the admin Blog manager. */
  content: unknown;
  paragraphClassName?: string;
  headingClassName?: string;
  strongClassName?: string;
  listClassName?: string;
  listItemClassName?: string;
}

/**
 * Public article body renderer for the company blog pages. Same convention as the admin editor
 * preview and the apex BlogDetailModal: blank line = new paragraph, "# " / "## " / "### " = heading,
 * **bold** / *italic* inline; plus "- " lines = bullet list. Rendered as React text, never HTML.
 * The page title is the h1, so body headings start at h2.
 */
export function BlogBody({ content, paragraphClassName, headingClassName, strongClassName, listClassName, listItemClassName }: BlogBodyProps) {
  const blocks: React.ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  const flush = () => {
    const text = paragraph.join(' ').trim();
    if (text) {
      blocks.push(
        <p key={`p${blocks.length}`} className={paragraphClassName}>
          <RichText text={text} strongClassName={strongClassName} />
        </p>,
      );
    }
    paragraph = [];
    if (list.length > 0) {
      blocks.push(
        <ul key={`l${blocks.length}`} className={listClassName}>
          {list.map((item, i) => (
            <li key={i} className={listItemClassName}><RichText text={item} strongClassName={strongClassName} /></li>
          ))}
        </ul>,
      );
    }
    list = [];
  };

  String(typeof content === 'string' ? content : '').split('\n').forEach((raw) => {
    const line = raw.trim();
    const heading = /^(#{1,3}) (.*)$/.exec(line);
    if (!line) {
      flush();
    } else if (heading) {
      flush();
      const Tag = heading[1].length === 3 ? 'h3' : 'h2';
      blocks.push(<Tag key={`h${blocks.length}`} className={headingClassName}>{heading[2]}</Tag>);
    } else if (line.startsWith('- ')) {
      if (paragraph.length > 0) flush(); // lead-in line ends where the list starts
      list.push(line.slice(2));
    } else {
      if (list.length > 0) flush();
      paragraph.push(line);
    }
  });
  flush();
  return <>{blocks}</>;
}
