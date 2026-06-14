"use client";

import { useState } from "react";

export function CopyCodeBlock({
  lang,
  code,
  label,
}: {
  lang: string;
  code: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="border border-white/10 overflow-hidden mt-4">
      <div className="bg-white/[0.03] border-b border-white/10 px-5 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {label && (
            <span className="text-xs text-white/40 truncate">{label}</span>
          )}
          <span className="text-xs font-mono text-white/20 shrink-0">{lang}</span>
        </div>
        <button
          onClick={copy}
          className={`shrink-0 flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 border transition-all duration-150 ${
            copied
              ? "border-[#10B981]/40 text-[#10B981] bg-[#10B981]/5"
              : "border-white/10 text-white/30 hover:text-white/70 hover:border-white/25"
          }`}
        >
          {copied ? (
            <>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M3 8H2a1 1 0 01-1-1V2a1 1 0 011-1h5a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="bg-black px-5 py-5 font-mono text-xs text-white/55 leading-relaxed overflow-x-auto whitespace-pre">
        {code}
      </pre>
    </div>
  );
}
