"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const EXCLUDED_PREFIXES = ["/login", "/signup", "/onboarding", "/terms", "/privacy"];

export default function ChattingScript() {
  const pathname = usePathname();

  if (pathname && EXCLUDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return null;
  }

  return (
    <Script
      src="/widget.js"
      data-site-id="a21f48aa-2b94-4f7a-aa75-6ab968729518"
      strategy="afterInteractive"
    />
  );
}
