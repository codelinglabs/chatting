import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        {/* Same Chatting SVG Logo from the OG implementation */}
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <path d="M20 4C11.163 4 4 11.163 4 20C4 28.837 11.163 36 20 36C21.85 36 23.619 35.6845 25.253 35.107L32.414 37.495C33.195 37.755 33.955 36.995 33.695 36.214L31.307 29.053C34.258 26.541 36 23.428 36 20C36 11.163 28.837 4 20 4Z" fill="#2563EB"/>
            <circle cx="14" cy="20" r="2.5" fill="white"/>
            <circle cx="20" cy="20" r="2.5" fill="white"/>
            <circle cx="26" cy="20" r="2.5" fill="white"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
