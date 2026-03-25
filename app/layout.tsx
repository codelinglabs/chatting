import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chatly",
  description: "Talk to users before they leave and learn what's blocking revenue."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

