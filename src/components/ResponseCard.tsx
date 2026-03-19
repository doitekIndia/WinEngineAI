import React from "react";
import ReactMarkdown from "react-markdown";
import { AgentBadge } from "./AgentBadge";
import { AgentResult } from "../utils/types";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface ResponseCardProps {
  result: AgentResult;
}

export const ResponseCard: React.FC<ResponseCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm mb-6">
      <div className="bg-zinc-50 border-bottom border-zinc-200 px-4 py-3 flex items-center justify-between">
        <AgentBadge agent={result.agent} />
        <button 
          onClick={() => handleCopy(result.response)}
          className="text-zinc-400 hover:text-zinc-600 transition-colors"
          title="Copy full response"
        >
          {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
        </button>
      </div>
      <div className="p-6 prose prose-zinc prose-sm max-w-none">
        <ReactMarkdown
          components={{
            h3: ({ children }) => <h3 className="text-zinc-900 font-semibold mt-6 mb-3 first:mt-0">{children}</h3>,
            p: ({ children }) => <p className="text-zinc-600 leading-relaxed mb-4">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-2">{children}</ul>,
            li: ({ children }) => <li className="text-zinc-600">{children}</li>,
            code: ({ children }) => (
              <code className="bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded font-mono text-xs">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-xl font-mono text-xs overflow-x-auto my-4 relative group">
                {children}
              </pre>
            ),
          }}
        >
          {result.response}
        </ReactMarkdown>
      </div>
    </div>
  );
};
