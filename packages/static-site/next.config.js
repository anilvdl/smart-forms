const path   = require("path");
const withTM = require("next-transpile-modules")([
  "@smartforms/shared",  
  // "@lib-db",             
]);

/** @type {import('next').NextConfig} */
module.exports = withTM({
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },

  // Allow importing files from outside of the project root
  experimental: {
    externalDir: true
  },

  webpack(config) {
    // Ensure the alias matches exactly your workspace folder
    // config.resolve.alias["@smartforms/lib-db"] = path.resolve(__dirname, "../lib-db");
    config.resolve.alias["@smartforms/lib-middleware"] = path.resolve(__dirname, "../lib-middleware");
    config.resolve.alias["@smartforms/shared"] = path.resolve(__dirname, "../shared");
    // config.module.rules.push({
    //   test: /\.svg$/,
    //   use: ["@svgr/webpack"],
    // });
    return config;
  }
});