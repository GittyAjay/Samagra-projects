/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next 15 devtools segment explorer can throw "SegmentViewNode ... not in React Client Manifest"
  // after server-action redirects and corrupt dev chunk state; safe to disable locally.
  experimental: {
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
