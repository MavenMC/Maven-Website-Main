import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'minotar.net',
        pathname: '/helm/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/avatars/**',
      },
      {
        protocol: 'https',
        hostname: 'www.minecraft.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mc-heads.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
