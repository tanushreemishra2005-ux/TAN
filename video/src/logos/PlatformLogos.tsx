import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const YouTubeMusicLogo: React.FC<LogoProps> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Red rounded rectangle */}
    <rect width="100" height="100" rx="20" fill="#FF0000" />
    {/* White triangle play button */}
    <path d="M40 30 L75 50 L40 70Z" fill="white" />
    {/* Music note accent */}
    <circle cx="72" cy="32" r="12" fill="white" opacity="0.9" />
    <rect x="70" y="20" width="4" height="20" rx="2" fill="white" opacity="0.9" />
  </svg>
);

export const SpotifyLogo: React.FC<LogoProps> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="50" fill="#1DB954" />
    {/* Sound waves */}
    <path d="M30 42 C35 38, 55 36, 70 42" stroke="#191414" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M33 52 C38 48, 55 46, 67 52" stroke="#191414" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M36 62 C40 58, 52 56, 64 62" stroke="#191414" strokeWidth="3.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const AppleMusicLogo: React.FC<LogoProps> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="appleGrad" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#FC5C7D" />
        <stop offset="100%" stopColor="#6A82FB" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="20" fill="url(#appleGrad)" />
    {/* Music note */}
    <path d="M60 25 V65 M60 65 C60 72 50 78 42 72 C34 66 40 58 50 58 C54 58 58 60 60 65Z" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" />
    <ellipse cx="40" cy="72" rx="12" ry="8" fill="white" opacity="0.9" />
  </svg>
);

export const JioSaavnLogo: React.FC<LogoProps> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="20" fill="#00D8F6" />
    {/* J letter stylized */}
    <path d="M35 30 L35 55 C35 65 45 72 55 65" stroke="white" strokeWidth="7" strokeLinecap="round" fill="none" />
    {/* Musical note dots */}
    <circle cx="62" cy="35" r="5" fill="white" />
    <circle cx="72" cy="48" r="4" fill="white" opacity="0.8" />
    <circle cx="68" cy="62" r="3" fill="white" opacity="0.6" />
  </svg>
);

export const YouTubeLogo: React.FC<LogoProps> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="20" fill="#FF0000" />
    {/* Play triangle */}
    <path d="M38 28 L72 50 L38 72Z" fill="white" />
  </svg>
);
