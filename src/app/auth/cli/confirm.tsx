"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CliAuthConfirmProps = {
  callback?: string;
};

export function CliAuthConfirm({ callback }: CliAuthConfirmProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleAuthorize() {
    setLoading(true);
    const params = new URLSearchParams();
    if (callback) params.set("callback", callback);
    params.set("confirmed", "true");
    router.push(`/auth/cli?${params.toString()}`);
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => window.close()}
        className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/50 text-sm transition-colors hover:bg-white/5"
      >
        Deny
      </button>
      <button
        onClick={handleAuthorize}
        disabled={loading}
        className="flex-1 px-4 py-3 rounded-xl bg-white text-black font-medium text-sm disabled:opacity-50"
      >
        {loading ? "Authorizing..." : "Authorize"}
      </button>
    </div>
  );
}
