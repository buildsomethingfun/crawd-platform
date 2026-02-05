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

      <div className="glass rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Create New Stream</h2>
        <form onSubmit={createStream} className="flex gap-4">
          <input
            type="text"
            value={newStreamName}
            onChange={(e) => setNewStreamName(e.target.value)}
            placeholder="Stream name"
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 placeholder:text-white/30"
          />
          <button
            type="submit"
            disabled={creating || !newStreamName.trim()}
            className="px-6 py-3 accent-gradient text-black font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="glass rounded-2xl p-8 text-center text-white/50">Loading...</div>
        ) : streams.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-white/50">
            No streams yet. Create one above.
          </div>
        ) : (
          streams.map((stream) => (
            <div key={stream.id} className="glass rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{stream.name}</h3>
                    {stream.isLive ? (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        LIVE
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-white/10 text-white/50 text-xs rounded-lg">
                        Offline
                      </span>
                    )}
                  </div>
                  {stream.isLive && (
                    <p className="text-sm text-white/50 mt-1">
                      {stream.viewerCount} viewers
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  {stream.muxPlaybackId && (
                    <Link
                      href={`/preview/${stream.muxPlaybackId}`}
                      className="text-sm text-accent hover:underline"
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

              <div className="bg-black/30 rounded-xl p-4 space-y-3">
                <p className="text-xs text-white/50 font-medium uppercase tracking-wide">OBS Settings</p>
                <div>
                  <p className="text-xs text-white/40 mb-1">Server</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-white/70 font-mono">
                      {stream.rtmpUrl}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(stream.rtmpUrl)}
                      className="px-3 py-1 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Stream Key</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-white/70 font-mono break-all">
                      {stream.streamKey}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(stream.streamKey)}
                      className="px-3 py-1 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors"
                    >
                      Copy
                    </button>
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
