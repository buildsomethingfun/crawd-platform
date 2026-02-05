"use client";

import { useState, useEffect } from "react";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  isActive: boolean;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    const res = await fetch("/api/keys");
    const data = await res.json();
    setKeys(data.keys);
    setLoading(false);
  }

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreating(true);
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName }),
    });
    const data = await res.json();

    if (data.key) {
      setNewKey(data.key);
      setNewKeyName("");
      fetchKeys();
    }
    setCreating(false);
  }

  async function revokeKey(id: string) {
    if (!confirm("Are you sure you want to revoke this API key?")) return;

    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    fetchKeys();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">API Keys</h1>

      <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
        <h2 className="text-lg font-semibold mb-4">Create New API Key</h2>
        <form onSubmit={createKey} className="flex gap-4">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g., My Agent)"
            className="flex-1 px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-white/40"
          />
          <button
            type="submit"
            disabled={creating || !newKeyName.trim()}
            className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Key"}
          </button>
        </form>
      </div>

      {newKey && (
        <div className="mb-8 p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
          <h3 className="font-semibold text-green-400 mb-2">
            API Key Created!
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Make sure to copy your API key now. You won&apos;t be able to see it
            again!
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-black/50 rounded font-mono text-sm break-all">
              {newKey}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newKey);
              }}
              className="px-4 py-3 bg-white/10 rounded hover:bg-white/20"
            >
              Copy
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="mt-4 text-sm text-gray-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left text-sm text-gray-400">
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Key</th>
              <th className="px-6 py-4 font-medium">Created</th>
              <th className="px-6 py-4 font-medium">Last Used</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No API keys yet. Create one above.
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id} className="border-b border-white/5">
                  <td className="px-6 py-4">{key.name}</td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-400">
                    {key.keyPrefix}...
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {key.lastUsedAt
                      ? new Date(key.lastUsedAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4">
                    {key.isActive ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                        Revoked
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {key.isActive && (
                      <button
                        onClick={() => revokeKey(key.id)}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
