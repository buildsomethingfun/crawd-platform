import Mux from "@mux/mux-node";

const tokenId = process.env.MUX_TOKEN_ID?.trim();
const tokenSecret = process.env.MUX_TOKEN_SECRET?.trim();

// Debug logging (safe - only shows lengths and prefixes)
console.log("[mux] Initializing Mux client");
console.log("[mux] MUX_TOKEN_ID length:", tokenId?.length, "prefix:", tokenId?.slice(0, 8));
console.log("[mux] MUX_TOKEN_SECRET length:", tokenSecret?.length, "prefix:", tokenSecret?.slice(0, 8));

export const mux = new Mux({
  tokenId,
  tokenSecret,
});

export const MUX_RTMP_URL = "rtmp://global-live.mux.com:5222/app";
