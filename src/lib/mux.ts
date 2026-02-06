import Mux from "@mux/mux-node";

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID?.trim(),
  tokenSecret: process.env.MUX_TOKEN_SECRET?.trim(),
});

export const MUX_RTMP_URL = "rtmp://global-live.mux.com:5222/app";

/**
 * Query Mux for the real-time status of a live stream.
 * Returns { status, isLive } where status is the raw Mux status
 * ("active", "idle", "disabled", etc.) and isLive is true when actively streaming.
 */
export async function getMuxStreamStatus(muxLiveStreamId: string) {
  const liveStream = await mux.video.liveStreams.retrieve(muxLiveStreamId);
  return {
    status: liveStream.status,
    isLive: liveStream.status === "active",
  };
}
