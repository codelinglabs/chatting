import type { Metadata } from "next";
import Script from "next/script";
import ChattingScript from "./chatting-script";
import { ToastProvider } from "./ui/toast-provider";
import "./globals.css";

const ANALYTICS_SCRIPT_SRC = "https://grometrics-166523647849.europe-west1.run.app/js/script.js";
const ANALYTICS_WEBSITE_ID = "gm_13c7a11993d9d7ce797e06a3";
const ANALYTICS_DOMAIN = "usechatting.com";

export const metadata: Metadata = {
  title: "Chatting",
  description: "Talk to users before they leave and learn what's blocking revenue.",
  openGraph: {
    type: "website",
    siteName: "Chatting",
    title: "Chatting",
    description: "Talk to users before they leave and learn what's blocking revenue.",
    images: [{
      url: "/api/og?template=a",
      width: 1200,
      height: 630,
      alt: "Chatting — Live chat for small teams who care."
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Chatting",
    description: "Talk to users before they leave and learn what's blocking revenue.",
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
        <Script
          defer
          data-website-id={ANALYTICS_WEBSITE_ID}
          data-domain={ANALYTICS_DOMAIN}
          src={ANALYTICS_SCRIPT_SRC}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
