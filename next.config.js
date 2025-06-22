/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "chat-app-s3-hyub.s3.ap-northeast-2.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "chat-app-s3-hyub.s3.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "chat2-bucket.s3.amazonaws.com",
        pathname: "**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
