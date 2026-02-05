import Script from "next/script";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ playbackId: string }>;
}) {
  const { playbackId } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <Script src="https://cdn.jsdelivr.net/npm/@mux/mux-player" />

      <div className="max-w-5xl mx-auto p-4">
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
          {/* @ts-expect-error - mux-player is a web component */}
          <mux-player
            playback-id={playbackId}
            stream-type="live"
            autoplay="muted"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400">
            Stream ID: <code className="text-gray-300">{playbackId}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
