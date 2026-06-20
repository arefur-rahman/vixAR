import {
    constructMetadata,
    constructViewport,
    SiteConfig,
} from "@/lib/metadata";
import type { Metadata, Viewport } from "next";
import { Roboto, Playfair_Display, Fira_Code } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const fontSans = Roboto({
    subsets: ["latin"],
    variable: "--font-sans",
});

const fontSerif = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-serif",
});

const fontMono = Fira_Code({
    subsets: ["latin"],
    variable: "--font-mono",
});

export const siteConfig: SiteConfig = {
    baseUrl: "https://site_url.com",
    siteName: "vixAR",
    title: "vixAR",
    description: "vixAR",
    ogImage: "/vixARLight.webp",
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
            className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}  h-full antialiased`}
            suppressHydrationWarning
        >
            <body className="min-h-full flex flex-col">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
