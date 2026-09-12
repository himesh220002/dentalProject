import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
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
