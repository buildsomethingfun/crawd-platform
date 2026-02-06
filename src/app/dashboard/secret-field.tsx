"use client";

import { useState } from "react";
import { CopyButton } from "./copy-button";

export function SecretField({ value, label }: { value: string; label: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      <label className="block text-xs text-white/40 mb-2 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <code className="flex-1 px-4 py-3 bg-black/30 rounded-xl font-mono text-sm text-white/80 break-all select-all">
          {revealed ? value : "••••••••••••••••••••••••"}
        </code>
        <button
          onClick={() => setRevealed(!revealed)}
          className="px-3 py-2 rounded-lg text-xs font-medium flex-shrink-0 bg-white/10 text-white/60 transition-none hover:bg-white/20 hover:text-white/80"
        >
          {revealed ? "Hide" : "Show"}
        </button>
        <CopyButton text={value} />
      </div>
    </div>
  );
}
