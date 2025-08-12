import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match;

      if (isInline) {
        return (
          <code className="text-xs sm:text-sm bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 font-mono">
            {children}
          </code>
        );
      }

      const lang = match?.[1] ?? 'text';
      return (
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm border border-gray-700 my-3 whitespace-pre-wrap">
          <code className={`language-${lang}`}>
            {children}
          </code>
        </pre>
      );
    },
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4 py-1">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="border-t border-gray-300 my-6" />,
    table: ({ children }) => (
      <div className="overflow-x-auto my-4 border border-gray-300 rounded">
        <table className="min-w-full border-collapse">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-50">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="border-b border-gray-300 px-3 py-2 text-left text-sm font-semibold bg-gray-50">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-b border-gray-300 px-3 py-2 text-sm">
        {children}
      </td>
    ),
    tr: ({ children }) => (
      <tr className="even:bg-gray-50 hover:bg-gray-100">{children}</tr>
    ),
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
