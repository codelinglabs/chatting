"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { isLocalHostLike } from "@/lib/local-host";

const ANALYTICS_SCRIPT_SRC = "https://grometrics-166523647849.europe-west1.run.app/js/script.js";
const ANALYTICS_WEBSITE_ID = "gm_13c7a11993d9d7ce797e06a3";
const ANALYTICS_DOMAIN = "usechatting.com";

export default function GrometricsScript() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!isLocalHostLike(window.location.hostname)) {
      setShouldLoad(true);
    }
  }, []);

  return shouldLoad ? (
    <Script
      id="grometrics-script"
      defer
      data-website-id={ANALYTICS_WEBSITE_ID}
      data-domain={ANALYTICS_DOMAIN}
      src={ANALYTICS_SCRIPT_SRC}
      strategy="afterInteractive"
    />
  ) : null;
}
