import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { YouTubeMusicLogo, SpotifyLogo, AppleMusicLogo } from '../logos/PlatformLogos';

interface EndcardSceneProps {
  isVertical: boolean;
}

export const EndcardScene: React.FC<EndcardSceneProps> = ({ isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = interpolate(frame, [0, fps * 0.35], [0.7, 1], { extrapolateRight: 'clamp' });
  const logoFade = interpolate(frame, [0, fps * 0.3], [0, 1], { extrapolateRight: 'clamp' });
  const tagFade = interpolate(frame, [fps * 0.2, fps * 0.5], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const tagY = interpolate(frame, [fps * 0.2, fps * 0.5], [15, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const ctaFade = interpolate(frame, [fps * 0.5, fps * 0.8], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  const wavePhase = frame * 0.08;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #FAF7F2 0%, #FFF9E6 100%)' }}>
      {/* Subtle background wave bars */}
      <AbsoluteFill style={{ opacity: 0.04 }}>
        <div style={{ position: 'absolute', bottom: isVertical ? '20%' : '12%', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: isVertical ? 8 : 10 }}>
          {Array.from({ length: isVertical ? 16 : 30 }).map((_, i) => (
            <div key={i} style={{ width: isVertical ? 5 : 7, height: 10 + Math.sin(wavePhase + i * 0.4) * 20, borderRadius: 4, backgroundColor: ['#FF6B6B', '#FDE047', '#6EE7B7', '#7DD3FC', '#C4B5FD'][i % 5] }} />
          ))}
        </div>
      </AbsoluteFill>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isVertical ? 24 : 28, opacity: logoFade, transform: `scale(${logoScale})`, zIndex: 1 }}>
        {/* Logo icon */}
        <div style={{ width: isVertical ? 80 : 100, height: isVertical ? 80 : 100, borderRadius: 20, backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '5px 5px 0px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isVertical ? 4 : 5, height: 40 }}>
            {[16, 28, 22, 34, 14].map((h, i) => (
              <div key={i} style={{ width: isVertical ? 6 : 7, height: h + Math.sin(wavePhase + i * 0.7) * 5, borderRadius: 3, backgroundColor: ['#FF6B6B', '#FDE047', '#6EE7B7', '#7DD3FC', '#C4B5FD'][i] }} />
            ))}
          </div>
        </div>

        {/* Brand name */}
        <h1 style={{ fontSize: isVertical ? 72 : 96, fontWeight: 900, color: '#000', margin: 0, letterSpacing: '-0.03em', fontFamily: "'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif" }}>FineTune</h1>

        {/* Tagline */}
        <div style={{ opacity: tagFade, transform: `translateY(${tagY}px)`, textAlign: 'center' }}>
          <p style={{ fontSize: isVertical ? 32 : 42, fontWeight: 800, color: 'rgba(0,0,0,0.5)', margin: 0 }}>Hum to discover any song</p>
        </div>

        {/* CTA */}
        <div style={{ opacity: ctaFade }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 36px', borderRadius: 16, backgroundColor: '#FF6B6B', border: '3px solid #000', boxShadow: '5px 5px 0px #000' }}>
            <span style={{ fontSize: isVertical ? 22 : 26, fontWeight: 900, color: '#000' }}>Try FineTune Free</span>
            <span style={{ fontSize: isVertical ? 20 : 24 }}>🎙️</span>
          </div>
        </div>

        {/* Platform logos */}
        <div style={{ opacity: ctaFade, display: 'flex', gap: isVertical ? 20 : 32, marginTop: 8, alignItems: 'center' }}>
          <YouTubeMusicLogo size={isVertical ? 32 : 36} />
          <SpotifyLogo size={isVertical ? 32 : 36} />
          <AppleMusicLogo size={isVertical ? 32 : 36} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
