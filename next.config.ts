import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
    // 1. 强制 Webpack 模式，确保兼容性
    webpack: (config) => {
        return config;
    },

    // 2. 仅保留 typescript 忽略配置（这个 Next.js 16 还支持）
    typescript: {
        ignoreBuildErrors: true,
    },

    // 注意：删掉了 eslint 这一块，因为它是报错的根源
};

export default withPWA(nextConfig);