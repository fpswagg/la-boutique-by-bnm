/** @type {import('next').NextConfig} */
const nextConfig = {
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
