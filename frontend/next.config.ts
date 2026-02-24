import type { NextConfig } from "next";

const IMAGE_HOSTNAMES = process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES || "";

const imageHostnames = IMAGE_HOSTNAMES.split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imageHostnames.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
};

export default nextConfig;
