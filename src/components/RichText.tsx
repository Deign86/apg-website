import React from 'react';

interface RichTextProps {
  text: unknown;
  /** Classes for **bold** runs (the surrounding element keeps its own text styles). */
  strongClassName?: string;
}

const TOKEN = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;

/**
 * Admin rich text, rendered as React text (never HTML): **bold**, *italic*, line breaks.
 * Same markdown-ish convention as blog bodies; anything else shows literally.
 */
export function RichText({ text, strongClassName }: RichTextProps) {
  const lines = (typeof text === 'string' ? text : '').split('\n');
  return (
    <>
      {lines.map((line, lineIdx) => (
        <React.Fragment key={lineIdx}>
          {lineIdx > 0 && <br />}
          {line.split(TOKEN).map((part, i) => {
            if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className={strongClassName}>{part.slice(2, -2)}</strong>;
            }
            if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
              return <em key={i}>{part.slice(1, -1)}</em>;
            }
            return part;
          })}
        </React.Fragment>
      ))}
    </>
  );
}
