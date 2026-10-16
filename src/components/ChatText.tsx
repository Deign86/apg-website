import React from 'react';
import { splitListingRun } from '@/lib/chatLayout';

/**
 * Chat message text as React elements (never HTML): blank lines split paragraphs, single line
 * breaks are kept, "- " / "* " / "• " lines become bullet lists, "1. " / "1) " lines numbered
 * lists, and **bold** is bolded. A line that runs several listings together is shown as a bullet
 * list, one listing per item (splitListingRun). Used by the visitor widget and the admin Live Chat.
 */
const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBERED = /^\s*(\d{1,3})[.)]\s+(.*)$/;

// The ** must hug the text and not touch other stars or letters, so censored words ("g*** ka b***") stay literal.
const BOLD = /((?<![*\w])\*\*[^\s*](?:[^*\n]*[^\s*])?\*\*(?![*\w]))/g;

function inline(text: string): React.ReactNode[] {
  return text.split(BOLD).map((part, i) =>
    part.length > 4 && part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );
}

type Block = { kind: 'p' | 'ul' | 'ol'; lines: string[]; start?: number };

export default function ChatText({ text }: { text: string }) {
  const blocks: Block[] = [];
  for (const line of String(text ?? '').split(/\r?\n/).flatMap(splitListingRun)) {
    if (line.trim() === '') {
      blocks.push({ kind: 'p', lines: [] }); // paragraph break
      continue;
    }
    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);
    const kind = bullet ? 'ul' : numbered ? 'ol' : 'p';
    const content = bullet ? bullet[1] : numbered ? numbered[2] : line;
    const last = blocks[blocks.length - 1];
    if (last && last.kind === kind && (kind !== 'p' || last.lines.length > 0)) last.lines.push(content);
    else blocks.push({ kind, lines: [content], start: numbered ? Number(numbered[1]) : undefined });
  }

  return (
    <>
      {blocks.filter((b) => b.lines.length > 0).map((b, i) => {
        if (b.kind === 'p') {
          return (
            <p key={i}>
              {b.lines.map((l, j) => (
                <React.Fragment key={j}>
                  {j > 0 && <br />}
                  {inline(l)}
                </React.Fragment>
              ))}
            </p>
          );
        }
        const items = b.lines.map((l, j) => <li key={j}>{inline(l)}</li>);
        return b.kind === 'ul' ? <ul key={i}>{items}</ul> : <ol key={i} start={b.start}>{items}</ol>;
      })}
    </>
  );
}
