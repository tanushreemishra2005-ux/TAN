import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface SceneProps {
  isVertical: boolean;
}

/**
 * Scene 1: Hook (0-3s)
 * Lead with the viewer's problem — everyone has hummed a song and forgotten the name.
 */
export const HookScene: React.FC<SceneProps> = ({ isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in
  const fadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Text slide up
  const slideUp = interpolate(frame, [0, fps * 0.6], [30, 0], {
    extrapolateRight: 'clamp',
  });

  // Question mark bounce
  const bounce = interpolate(
    frame,
    [fps * 1, fps * 1.3, fps * 1.5, fps * 1.8],
    [0, -15, 0, -5],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // Subtitle fade
  const subtitleFade = interpolate(frame, [fps * 0.8, fps * 1.3], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  // Waveform bars animation
  const wavePhase = frame * 0.15;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
      }}
    >
      {/* Animated waveform background */}
      <AbsoluteFill style={{ opacity: 0.08 }}>
        <div
          style={{
            position: 'absolute',
            bottom: isVertical ? '25%' : '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: isVertical ? 6 : 8,
          }}
        >
          {Array.from({ length: isVertical ? 20 : 40 }).map((_, i) => {
            const height = 20 + Math.sin(wavePhase + i * 0.4) * 40 + Math.cos(wavePhase * 0.7 + i * 0.2) * 20;
            return (
              <div
                key={i}
                style={{
                  width: isVertical ? 4 : 6,
                  height: Math.max(8, height),
                  borderRadius: 3,
                  backgroundColor: ['#FF6B6B', '#FDE047', '#6EE7B7', '#7DD3FC', '#C4B5FD'][i % 5],
                  transition: 'height 0.1s ease',
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Main text */}
      <div
        style={{
          opacity: fadeIn,
          transform: `translateY(${slideUp}px)`,
          textAlign: 'center',
          maxWidth: isVertical ? 900 : 1400,
          padding: isVertical ? '0 60px' : '0 80px',
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontSize: isVertical ? 28 : 32,
            color: '#FDE047',
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          The Problem
        </p>
        <h1
          style={{
            fontSize: isVertical ? 64 : 96,
            fontWeight: 900,
            color: 'white',
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Ever hummed a song
          <br />
          you couldn't
          <span style={{ display: 'inline-block', transform: `translateY(${bounce}px)` }}>?</span>
        </h1>
        <p
          style={{
            fontSize: isVertical ? 28 : 36,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 24,
            fontWeight: 600,
            opacity: subtitleFade,
          }}
        >
          That melody stuck in your head… but the name is gone.
        </p>
      </div>
    </AbsoluteFill>
  );
};
