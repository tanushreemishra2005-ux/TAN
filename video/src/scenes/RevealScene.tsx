import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface SceneProps {
  isVertical: boolean;
}

/**
 * Scene 2: Product Reveal (3-6s)
 * Product name + tagline — "Hum it. Find it."
 */
export const RevealScene: React.FC<SceneProps> = ({ isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo scale-in with spring
  const logoScale = interpolate(frame, [0, fps * 0.4], [0.5, 1], {
    extrapolateRight: 'clamp',
  });

  const logoOpacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Tagline slide in
  const taglineY = interpolate(frame, [fps * 0.3, fps * 0.7], [40, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });
  const taglineOpacity = interpolate(frame, [fps * 0.3, fps * 0.7], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  // Subtitle fade
  const subFade = interpolate(frame, [fps * 0.8, fps * 1.2], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  // Soundwave icon bars
  const wavePhase = frame * 0.12;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #FAF7F2 0%, #FDFBF7 100%)',
      }}
    >
      {/* Brand logo area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
        }}
      >
        {/* Soundwave icon */}
        <div
          style={{
            width: isVertical ? 100 : 120,
            height: isVertical ? 100 : 120,
            borderRadius: 24,
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            boxShadow: '6px 6px 0px #000',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: isVertical ? 5 : 6, height: 50 }}>
            {[20, 36, 28, 42, 18].map((h, i) => {
              const animated = h + Math.sin(wavePhase + i * 0.8) * 8;
              const colors = ['#FF6B6B', '#FDE047', '#6EE7B7', '#7DD3FC', '#C4B5FD'];
              return (
                <div
                  key={i}
                  style={{
                    width: isVertical ? 7 : 9,
                    height: animated,
                    borderRadius: 4,
                    backgroundColor: colors[i],
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Brand name */}
        <h1
          style={{
            fontSize: isVertical ? 80 : 110,
            fontWeight: 900,
            color: '#000',
            margin: 0,
            letterSpacing: '-0.03em',
            fontFamily: "'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif",
          }}
        >
          FineTune
        </h1>

        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
          }}
        >
          <p
            style={{
              fontSize: isVertical ? 40 : 56,
              fontWeight: 900,
              color: '#FF6B6B',
              margin: '16px 0 0 0',
              letterSpacing: '-0.01em',
            }}
          >
            Hum it. Find it.
          </p>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: isVertical ? 24 : 30,
            fontWeight: 600,
            color: 'rgba(0,0,0,0.45)',
            marginTop: 20,
            opacity: subFade,
          }}
        >
          Powered by YouTube Music &amp; Spotify
        </p>
      </div>
    </AbsoluteFill>
  );
};
