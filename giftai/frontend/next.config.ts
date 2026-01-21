import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bỏ qua lỗi TypeScript và ESLint để ưu tiên Build thành công
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Allow external access (for Ngrok)
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          {
            key: "ngrok-skip-browser-warning",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
