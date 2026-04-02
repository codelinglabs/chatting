import type { Metadata } from "next";
import { getSiteBaseUrl, SITE_SEO_DESCRIPTION, SITE_SEO_TITLE } from "@/lib/site-seo";
import ChattingScript from "./chatting-script";
import GrometricsScript from "./grometrics-script";
import { ToastProvider } from "./ui/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_SEO_TITLE,
  description: SITE_SEO_DESCRIPTION,
  metadataBase: new URL(getSiteBaseUrl()),
  openGraph: {
    type: "website",
    siteName: "Chatting",
    title: SITE_SEO_TITLE,
    description: SITE_SEO_DESCRIPTION,
    images: [{
      url: "/api/og?template=a",
      width: 1200,
      height: 630,
      type: "image/png",
      alt: "Chatting — Live chat for small teams who care."
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_SEO_TITLE,
    description: SITE_SEO_DESCRIPTION,
    images: ["/api/og?template=a"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ToastProvider>{children}</ToastProvider>
        <ChattingScript />
        <GrometricsScript />
      </body>
    </html>
  );
}
