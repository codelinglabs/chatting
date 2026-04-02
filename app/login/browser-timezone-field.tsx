"use client";

import { useEffect, useState } from "react";
import { isValidTimeZone } from "@/lib/timezones";

export function BrowserTimeZoneField({ name = "timezone" }: { name?: string }) {
  const [timeZone, setTimeZone] = useState("");

  useEffect(() => {
    const resolvedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone?.trim();
    if (isValidTimeZone(resolvedTimeZone)) {
      setTimeZone(resolvedTimeZone);
    }
  }, []);

  return (
    <input
      type="hidden"
      name={name}
      value={timeZone}
      readOnly
    />
  );
}
