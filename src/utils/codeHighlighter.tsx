import React from 'react';

interface CodeHighlighterProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export const CodeHighlighter: React.FC<CodeHighlighterProps> = ({
  code,
  language = 'javascript',
  showLineNumbers = true,
}) => {
  const lines = code.split('\n');

  // Simple token regexes for syntax highlighting
  const highlightLine = (line: string): React.ReactNode => {
    if (!line) return <span>&nbsp;</span>;

    // Check for comment
    if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return <span className="text-slate-400 dark:text-slate-500 italic">{line}</span>;
    }

    // Tokenizer matching strings, numbers, keywords, functions
    const regex = /(["'`].*?["'`])|(\b\d+(\.\d+)?\b)|(\b(const|let|var|function|return|if|else|for|while|import|export|from|default|class|extends|async|await|try|catch|finally|throw|new|typeof|instanceof|interface|type|def|elif|lambda|self|True|False|None)\b)|(\b[A-Za-z0-9_]+(?=\())\b/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }

      const [full, str, num, _dummy, kw, fn] = match;

      if (str) {
        parts.push(
          <span key={match.index} className="text-emerald-600 dark:text-emerald-400">
            {str}
          </span>
        );
      } else if (num) {
        parts.push(
          <span key={match.index} className="text-amber-600 dark:text-amber-400 font-semibold tabular-nums">
            {num}
          </span>
        );
      } else if (kw) {
        parts.push(
          <span key={match.index} className="text-violet-600 dark:text-violet-400 font-semibold">
            {kw}
          </span>
        );
      } else if (fn) {
        parts.push(
          <span key={match.index} className="text-sky-600 dark:text-sky-300">
            {fn}
          </span>
        );
      } else {
        parts.push(full);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return parts;
  };

  return (
    <pre className="text-xs sm:text-sm font-mono leading-relaxed overflow-x-auto selection:bg-amber-500/30">
      <code>
        {lines.map((line, idx) => (
          <div key={idx} className="table-row hover:bg-slate-100/60 dark:hover:bg-slate-800/40">
            {showLineNumbers && (
              <span className="table-cell pr-4 pl-2 text-right select-none text-slate-400 dark:text-slate-600 text-xs w-8 tabular-nums border-r border-slate-200 dark:border-slate-800/80 mr-3">
                {idx + 1}
              </span>
            )}
            <span className="table-cell pl-3 text-slate-800 dark:text-slate-200 whitespace-pre">
              {highlightLine(line)}
            </span>
          </div>
        ))}
      </code>
    </pre>
  );
};
