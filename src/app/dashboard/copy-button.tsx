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
      className="px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-sm flex-shrink-0"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
