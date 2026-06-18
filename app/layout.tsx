import {
    constructMetadata,
    constructViewport,
    SiteConfig,
} from "@/lib/metadata";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const siteConfig: SiteConfig = {
    baseUrl: "https://site_url.com",
    siteName: "Site Name",
    title: "Site Name",
    description: "Site description",
    ogImage: "/brand_logo_xl.png",
    twitterHandle: "@brandname",
    authorName: "Arefur Rahman Khan",
    portfolioUrl: "http://arefolio.vercel.app/",
    locale: "en_US",
    themeColor: "#F0F9FF",
    keywords: ["keyword1", "keyword2", "keyword3"],
};

export const metadata: Metadata = constructMetadata(siteConfig);
export const viewport: Viewport = constructViewport(siteConfig);

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}
