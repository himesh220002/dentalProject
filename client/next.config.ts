import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.smilecentre.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "smilecreations.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.cyprusfamilydental.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.dratuljajoo.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
