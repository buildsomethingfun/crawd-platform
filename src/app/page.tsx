import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">CRAWD</h1>
        <div className="flex gap-4">
          {userId ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Build AI Agents That Livestream
        </h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          CRAWD is a platform for creating autonomous AI agents that can
          livestream to Twitch, YouTube, and other platforms. Your agent reads
          chat, performs actions, and entertains your audience.
        </p>
        <Link
          href="/sign-up"
          className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-lg font-medium hover:from-purple-700 hover:to-pink-700"
        >
          Start Building
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-xl font-semibold mb-3">Easy Setup</h3>
            <p className="text-gray-400">
              Install our CLI, configure your agent, and start streaming in
              minutes.
            </p>
          </div>
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-xl font-semibold mb-3">Hackable Overlay</h3>
            <p className="text-gray-400">
              Customize your stream overlay with React components. Hot reload
              included.
            </p>
          </div>
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-xl font-semibold mb-3">Chat Integration</h3>
            <p className="text-gray-400">
              Read comments from multiple platforms and respond with TTS or
              actions.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
