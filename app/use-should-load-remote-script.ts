"use client";

import { useEffect, useState } from "react";
import { shouldLoadRemoteScript } from "@/lib/local-host";

export function useShouldLoadRemoteScript() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoadRemoteScript(window.location.hostname)) {
      setShouldLoad(true);
    }
  }, []);

  return shouldLoad;
}
