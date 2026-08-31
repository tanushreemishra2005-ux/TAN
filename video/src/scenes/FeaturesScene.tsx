import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface FeaturesSceneProps {
  isVertical: boolean;
}

/**
 * Scene 4: Features (15-21s) — 6 seconds
 * Showcase key capabilities with staggered card reveals.
 */
export const FeaturesScene: React.FC<FeaturesSceneProps> = ({ isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const features = [
    { icon: '🎧', title: 'YouTube Music', subtitle: 'Stream instantly', bg: '#FF6B6B', delay: 0 },
    { icon: '🟢', title: 'Spotify', subtitle: 'Find on any platform', bg: '#6EE7B7', delay: 4 },
    { icon: '🎤', title: 'Karaoke Mode', subtitle: 'Sing with lyrics', bg: '#FDE047', delay: 8 },
    { icon: '🎬', title: 'Create Reels', subtitle: '15s video clips', bg: '#7DD3FC', delay: 12 },
  ];

  const titleFade = interpolate(frame, [0, fps * 0.4], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, fps * 0.4], [20, 0], { extrapolateRight: 'clamp' });
  const subFade = interpolate(frame, [fps * 0.3, fps * 0.7], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #FAF7F2 0%, #FFF9E6 100%)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isVertical ? 40 : 48, maxWidth: isVertical ? 900 : 1400, padding: isVertical ? '0 40px' : '0 80px' }}>
        <div style={{ textAlign: 'center', opacity: titleFade, transform: `translateY(${titleY}px)` }}>
          <p style={{ fontSize: isVertical ? 22 : 24, fontWeight: 800, color: '#FF6B6B', letterSpacing: '0.15em', textTransform: 'uppercase' as const, margin: '0 0 12px 0' }}>Everything You Need</p>
          <h2 style={{ fontSize: isVertical ? 52 : 72, fontWeight: 900, color: '#000', margin: 0, lineHeight: 1.1 }}>One hum. Endless possibilities.</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isVertical ? '1fr' : 'repeat(2, 1fr)', gap: isVertical ? 20 : 24, width: '100%' }}>
          {features.map((f) => {
            const cardFade = interpolate(frame, [fps * 0.3 + f.delay, fps * 0.6 + f.delay], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
            const cardY = interpolate(frame, [fps * 0.3 + f.delay, fps * 0.6 + f.delay], [30, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
            return (
              <div key={f.title} style={{ opacity: cardFade, transform: `translateY(${cardY}px)`, display: 'flex', alignItems: 'center', gap: isVertical ? 16 : 20, padding: isVertical ? '20px 24px' : '24px 28px', borderRadius: 20, backgroundColor: f.bg, border: '2.5px solid #000', boxShadow: '4px 4px 0px #000' }}>
                <div style={{ width: isVertical ? 56 : 64, height: isVertical ? 56 : 64, borderRadius: 16, backgroundColor: '#fff', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isVertical ? 28 : 32, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontSize: isVertical ? 24 : 28, fontWeight: 900, color: '#000', margin: 0 }}>{f.title}</h3>
                  <p style={{ fontSize: isVertical ? 16 : 18, fontWeight: 600, color: 'rgba(0,0,0,0.6)', margin: '4px 0 0 0' }}>{f.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ opacity: subFade, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderRadius: 100, backgroundColor: '#000', boxShadow: '3px 3px 0px rgba(0,0,0,0.2)' }}>
          <span style={{ fontSize: isVertical ? 22 : 24, fontWeight: 900, color: '#FDE047' }}>20+ Languages</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
          <span style={{ fontSize: isVertical ? 20 : 22, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Hindi • Tamil • Telugu • English &amp; more</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
