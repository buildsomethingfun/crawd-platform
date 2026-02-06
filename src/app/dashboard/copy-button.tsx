"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className={`px-3 py-2 rounded-lg text-xs font-medium flex-shrink-0 transition-none ${
        copied
          ? "bg-green-500/20 text-green-400"
          : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80"
      }`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
