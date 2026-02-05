"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const res = await fetch("/api/profile");
    const data = await res.json();
    setDisplayName(data.displayName || "");
    setBio(data.bio || "");
    setLoading(false);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-white/50">Loading...</div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="max-w-xl">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-6">Streamer Profile</h2>
          <form onSubmit={saveProfile} className="space-y-5">
            <div>
              <label className="block text-sm text-white/50 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your streamer name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell viewers about yourself..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 placeholder:text-white/30 resize-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 accent-gradient text-black font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              {saved && (
                <span className="text-green-400 text-sm">Saved!</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
