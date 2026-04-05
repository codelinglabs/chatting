import type { SVGProps } from "react";

export function HelpCenterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17.5A2.5 2.5 0 0 0 17.5 17H5Z" />
      <path d="M5 4.5V22h12.5A2.5 2.5 0 0 0 20 19.5V17" />
      <path d="M8.5 7.5h7" />
      <path d="M8.5 11h7" />
    </svg>
  );
}
