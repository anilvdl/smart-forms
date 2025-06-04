const path   = require("path");
const withTM = require("next-transpile-modules")([
  //"@smartforms/shared",
  path.resolve(__dirname, '../shared')
]);

/** @type {import('next').NextConfig} */
module.exports = withTM({
  reactStrictMode: true,
  images: {
    remotePatterns: [
        {
            protocol: "https",
            hostname: "lh3.googleusercontent.com", // Allow images from Google user profile
        },
    ],
    unoptimized: true, // Disable image optimization
  },
  experimental: {
    externalDir: true
  },

  webpack(config) {
    config.resolve.alias["@smartforms/shared"] = path.resolve(__dirname, "../shared");
    // config.resolve.alias["@smartforms/lib-db"] = path.resolve(__dirname, "../lib-db");
    config.resolve.alias["@smartforms/lib-middleware"] = path.resolve(__dirname, "../lib-middleware");
    // config.module.rules.push({
    //   test: /\.svg$/,
    //   use: ["@svgr/webpack"],
    // });
    return config;
  }
});