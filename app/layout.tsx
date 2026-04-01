import type { Metadata } from "next";
import ChattingScript from "./chatting-script";
import GrometricsScript from "./grometrics-script";
import { ToastProvider } from "./ui/toast-provider";
import "./globals.css";

const METADATA_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://usechatting.com";

export const metadata: Metadata = {
  title: "Chatting",
  description: "Talk to users before they leave and learn what's blocking revenue.",
  metadataBase: new URL(METADATA_BASE_URL),
  openGraph: {
    type: "website",
    siteName: "Chatting",
    title: "Chatting",
    description: "Talk to users before they leave and learn what's blocking revenue.",
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
        <GrometricsScript />
      </body>
    </html>
  );
}
