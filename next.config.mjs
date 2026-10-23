/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sastorage.fpswagg.site",
      },
      {
        protocol: "https",
        hostname: "**.fpswagg.site",
      },
    ],
  },
};

export default nextConfig;
