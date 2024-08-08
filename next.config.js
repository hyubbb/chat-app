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
    domains: [
      "uploadthing.com",
      "utfs.io",
      "lh3.googleusercontent.com",
      "i.pinimg.com",
      "chat-app-s3-hyub.s3.ap-northeast-2.amazonaws.com",
      "chat-app-s3-hyub.s3.amazonaws.com",
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_SITE_URL,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
