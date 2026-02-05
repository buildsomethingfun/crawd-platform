"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Stream = {
  id: string;
  name: string;
  streamKey: string;
  muxPlaybackId: string | null;
  rtmpUrl: string;
  isLive: boolean;
  viewerCount: number;
  createdAt: string;
};

export default function StreamsPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [newStreamName, setNewStreamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchStreams();
  }, []);

  async function fetchStreams() {
    const res = await fetch("/api/streams");
    const data = await res.json();
    setStreams(data.streams);
    setLoading(false);
  }

  async function createStream(e: React.FormEvent) {
    e.preventDefault();
    if (!newStreamName.trim()) return;

    setCreating(true);
    await fetch("/api/streams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newStreamName }),
    });

    setNewStreamName("");
    fetchStreams();
    setCreating(false);
  }

  async function deleteStream(id: string) {
    if (!confirm("Are you sure you want to delete this stream?")) return;

    await fetch(`/api/streams/${id}`, { method: "DELETE" });
    fetchStreams();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Streams</h1>

      <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
        <h2 className="text-lg font-semibold mb-4">Create New Stream</h2>
        <form onSubmit={createStream} className="flex gap-4">
          <input
            type="text"
            value={newStreamName}
            onChange={(e) => setNewStreamName(e.target.value)}
            placeholder="Stream name (e.g., Main Stream)"
            className="flex-1 px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-white/40"
          />
          <button
            type="submit"
            disabled={creating || !newStreamName.trim()}
            className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Stream"}
          </button>
        </form>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : streams.length === 0 ? (
          <div className="p-8 text-center text-gray-400 bg-white/5 rounded-xl border border-white/10">
            No streams yet. Create one above.
          </div>
        ) : (
          streams.map((stream) => (
            <div
              key={stream.id}
              className="p-6 bg-white/5 rounded-xl border border-white/10"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{stream.name}</h3>
                    {stream.isLive ? (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        LIVE
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">
                        Offline
                      </span>
                    )}
                  </div>
                  {stream.isLive && (
                    <p className="text-sm text-gray-400 mt-1">
                      {stream.viewerCount} viewers
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  {stream.muxPlaybackId && (
                    <Link
                      href={`/preview/${stream.muxPlaybackId}`}
                      className="text-sm text-blue-400 hover:text-blue-300"
                      target="_blank"
                    >
                      Preview
                    </Link>
                  )}
                  <button
                    onClick={() => deleteStream(stream.id)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-black/30 rounded-lg">
                  <p className="text-xs text-gray-400 mb-2">OBS Settings</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Server</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono text-sm text-gray-300">
                          {stream.rtmpUrl}
                        </code>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(stream.rtmpUrl)
                          }
                          className="px-3 py-1 bg-white/10 rounded text-sm hover:bg-white/20"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Stream Key</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono text-sm text-gray-300 break-all">
                          {stream.streamKey}
                        </code>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(stream.streamKey)
                          }
                          className="px-3 py-1 bg-white/10 rounded text-sm hover:bg-white/20"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
