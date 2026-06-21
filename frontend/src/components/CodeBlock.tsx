import { useState, useMemo } from 'react';
import { Check, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Props {
  language: string;
  children: string;
}

/**
 * CodeBlock - Renders syntax-highlighted code with a copy button.
 *
 * Uses react-syntax-highlighter with the One Dark theme for consistent
 * syntax coloring across 100+ languages. Falls back to plain text rendering
 * if the language is not recognized.
 *
 * @param language - The programming language for syntax highlighting
 * @param children - The raw code string to display
 */
export default function CodeBlock({ language, children }: Props) {
  const [copied, setCopied] = useState(false);

  /**
   * Custom style override for react-syntax-highlighter to match
   * the ChatSphere navy/dark theme with proper padding and background.
   */
  const customStyle: React.CSSProperties = useMemo(
    () => ({
      margin: 0,
      padding: '1rem',
      background: '#0D0F1A',
      fontSize: '0.875rem',
      lineHeight: '1.625',
      borderRadius: 0,
    }),
    []
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments where clipboard API is unavailable
      const textarea = document.createElement('textarea');
      textarea.value = children;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative my-3 overflow-hidden rounded-xl border border-navy-600/50">
      <div className="flex items-center justify-between border-b border-navy-600/50 bg-navy-800 px-4 py-2">
        <span className="font-mono text-xs uppercase text-gray-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-gray-400 transition-all hover:bg-navy-700 hover:text-white"
          aria-label="Copy code"
          type="button"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={customStyle}
        showLineNumbers={children.split('\n').length > 5}
        lineNumberStyle={{ color: '#4a5568', minWidth: '2.5em' }}
        wrapLongLines
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}
