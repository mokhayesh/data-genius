// next.config.mjs
/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // keep it minimal while we isolate the earlier "to must be string" issue
  webpack(cfg) {
    return cfg;
  },
};

export default config;
