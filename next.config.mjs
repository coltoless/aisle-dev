/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    // Corrupted `.next/cache/webpack/*.pack.gz` manifests as random dev 500s on chunk URLs.
    // Run `pnpm dev:nocache` (or `rm -rf .next` first) when that happens.
    if (dev && process.env.DISABLE_WEBPACK_CACHE === "1") {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
