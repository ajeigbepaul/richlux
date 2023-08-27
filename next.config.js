/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["mongoose"],
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  // env:{
  // DB_URL:process.env.MONGODB_URI
  // },
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    config.module.rules.push({
      test: /\.(mov|mp4|webm)$/,
      use: {
        loader: "file-loader",
        options: {
          publicPath: "/_next",
          name: "static/videos/[name].[hash].[ext]",
        },
      },
    });
    return config;
  },
};

module.exports = nextConfig;
