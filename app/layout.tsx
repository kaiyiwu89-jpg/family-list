import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. 字体定义建议放在最上方
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// 2. PWA 相关配置
export const viewport: Viewport = {
    themeColor: "#000000",
};

export const metadata: Metadata = {
    title: "我的家族清单",
    description: "让网页像 App 一样运行",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "家族清单",
    },
    formatDetection: {
        telephone: false,
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh">
            <head>
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
            </head>
            {/* 关键修改：将字体类名应用到 body 上 */}
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}