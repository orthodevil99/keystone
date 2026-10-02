/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' https://rpc.mainnet.arc.io https://rpc.testnet.arc.io https://explorer.arc.io wss:",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    // wagmi/viem: silence optional react-native deps
    config.resolve.fallback = { ...config.resolve.fallback, "@react-native-async-storage/async-storage": false };
    return config;
  },
};

module.exports = nextConfig;
