import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const components: Components = {
    p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,

    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-4 border-b border-gray-300 pb-1">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold text-gray-700 mt-5 mb-3">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2">
        {children}
      </h3>
    ),

    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-3 ml-4">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-3 ml-4">{children}</ol>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,

    // ✅ 修复：避免 ref 类型冲突
    code({ node, className, children, ...rest }) {
      const match = /language-(\w+)/.exec(className || "");
      const isInline = !match;

      if (isInline) {
        return (
          <code className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-sm font-mono">
            {children}
          </code>
        );
      }

      const lang = match[1];
      return (
        // ✅ 不传 {...rest}，避免 ref 冲突
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm border border-gray-700 my-3">
          <code className={`language-${lang} text-sm`}>{children}</code>
        </pre>
      );
    },

    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
      >
        {children}
      </a>
    ),

    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,

    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-3">
        {children}
      </blockquote>
    ),

    hr: () => <hr className="border-t border-gray-300 my-6" />,

    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-gray-300">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-300 px-4 py-2">{children}</td>
    ),
    tr: ({ children }) => (
      <tr className="even:bg-gray-50 dark:even:bg-gray-800">{children}</tr>
    ),
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
