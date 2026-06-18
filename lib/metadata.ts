import type { Metadata, Viewport } from "next";

export interface SiteConfig {
    baseUrl: string;
    siteName: string;
    title: string;
    description: string;
    ogImage?: string;
    twitterHandle?: string;
    authorName?: string;
    portfolioUrl?: string;
    locale?: string;
    themeColor?: string;
    keywords?: string[];
}

export function constructViewport(config: Partial<SiteConfig>): Viewport {
    return {
        width: "device-width",
        initialScale: 1,
        themeColor: config.themeColor || "#ffffff",
    };
}

export function constructMetadata(config: SiteConfig): Metadata {
    const {
        baseUrl,
        siteName,
        title,
        description,
        ogImage = "/brand_logo_xl.png",
        twitterHandle = "@brandName",
        authorName = "MD. Arefur Rahman Khan",
        portfolioUrl = "http://arefolio.vercel.app/",
        locale = "en_US",
        keywords = [],
    } = config;

    const ogImageFull = ogImage.startsWith("http")
        ? ogImage
        : `${baseUrl}${ogImage}`;

    return {
        metadataBase: new URL(baseUrl),
        title: {
            default: title,
            template: `%s | ${siteName}`,
        },
        description,
        keywords,
        authors: [{ name: authorName, url: portfolioUrl }],
        creator: authorName,
        publisher: siteName,
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },

        openGraph: {
            type: "website",
            locale,
            url: baseUrl,
            siteName,
            title,
            description,
            images: [
                {
                    url: ogImageFull,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },

        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImageFull],
            site: twitterHandle,
            creator: twitterHandle,
        },

        icons: {
            icon: [{ url: "/icon.ico", sizes: "any" }],
            apple: [{ url: "/icon.ico" }],
            shortcut: "/icon.ico",
        },

        alternates: {
            canonical: baseUrl,
        },

        category: "ecommerce",
    };
}

/**
 * Helper to build custom metadata for specific pages.
 * Pass your base config and the overrides.
 */
export function buildMetadata(
    override: Partial<Metadata>,
    baseConfig: SiteConfig,
): Metadata {
    const base = constructMetadata(baseConfig);
    return {
        ...base,
        ...override,
        openGraph: {
            ...base.openGraph,
            ...(override.openGraph ?? {}),
        },
        twitter: {
            ...base.twitter,
            ...(override.twitter ?? {}),
        },
    };
}
