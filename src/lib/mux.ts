import Mux from "@mux/mux-node";

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID?.trim(),
  tokenSecret: process.env.MUX_TOKEN_SECRET?.trim(),
});

export const MUX_RTMP_URL = "rtmp://global-live.mux.com:5222/app";
