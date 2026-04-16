import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/sound_generator/status",
        destination: "http://localhost:8000/sound_generator/status",
      },
      {
        source: "/api/sound_generator",
        destination: "http://localhost:8000/sound_generator/",
      },
    ];
  },
};

export default nextConfig;
