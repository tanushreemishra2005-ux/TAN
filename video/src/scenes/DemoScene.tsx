import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface SceneProps {
  isVertical: boolean;
}

/**
 * Scene 3: Demo (6-15s) — 9 seconds
 * The money shot: hum → waveform → identification → song match → streaming links
 * Phases:
 *   0-3s:   Recording waveform (humming)
 *   3-5s:   "Identifying..." state
 *   5-9s:   Song matched — show result card with streaming links
 */
export const DemoScene: React.FC<SceneProps> = ({ isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase calculations
  const recordEnd = 3 * fps;       // 90
  const identifyEnd = 5 * fps;     // 150
  // match phase: 150-270

  const isRecording = frame < recordEnd;
  const isIdentifying = frame >= recordEnd && frame < identifyEnd;
  const isMatched = frame >= identifyEnd;

  // Waveform animation
  const wavePhase = frame * 0.2;
  const micPulse = isRecording ? 1 + Math.sin(frame * 0.3) * 0.08 : 1;

  // Card entrance (matched state)
  const cardScale = interpolate(frame, [identifyEnd, identifyEnd + fps * 0.4], [0.85, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });
  const cardOpacity = interpolate(frame, [identifyEnd, identifyEnd + fps * 0.3], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  // Streaming links stagger
  const linksFade = (delay: number) =>
    interpolate(frame, [identifyEnd + fps * 0.6 + delay, identifyEnd + fps * 0.9 + delay], [0, 1], {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
    });

  // Countdown number
  const countdownNum = isRecording ? Math.max(1, 4 - Math.floor(frame / fps)) : 0;

  // Progress bar
  const progressWidth = isRecording
    ? (frame / recordEnd) * 100
    : isIdentifying
    ? 100
    : 100;

  const bgGradient = isMatched
    ? 'linear-gradient(135deg, #FAF7F2 0%, #FFF9E6 100%)'
    : isIdentifying
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)'
    : 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)';

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        background: bgGradient,
      }}
    >
      {/* Phase label */}
      <div
        style={{
          position: 'absolute',
          top: isVertical ? 80 : 60,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: isRecording ? '#FF6B6B' : isIdentifying ? '#FDE047' : '#6EE7B7',
            animation: isRecording || isIdentifying ? 'none' : undefined,
          }}
        />
        <span
          style={{
            fontSize: isVertical ? 18 : 20,
            fontWeight: 800,
            color: isMatched ? '#000' : 'rgba(255,255,255,0.6)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {isRecording
            ? 'HUMMING DETECTED'
            : isIdentifying
            ? 'IDENTIFYING ON YOUTUBE MUSIC & SPOTIFY...'
            : 'SONG MATCHED!'}
        </span>
      </div>

      {/* Recording / Identifying State */}
      {!isMatched && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 32,
          }}
        >
          {/* Mic icon with pulse */}
          <div
            style={{
              width: isVertical ? 120 : 140,
              height: isVertical ? 120 : 140,
              borderRadius: '50%',
              border: `3px solid ${isRecording ? '#FF6B6B' : '#FDE047'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${micPulse})`,
              boxShadow: isRecording ? '0 0 40px rgba(255,107,107,0.3)' : 'none',
            }}
          >
            <div
              style={{
                fontSize: isVertical ? 52 : 64,
              }}
            >
              🎙️
            </div>
          </div>

          {/* Waveform bars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isVertical ? 4 : 6 }}>
            {Array.from({ length: isVertical ? 20 : 32 }).map((_, i) => {
              const h = isRecording
                ? 15 + Math.sin(wavePhase + i * 0.35) * 35 + Math.cos(wavePhase * 0.6 + i * 0.15) * 20
                : 8 + Math.sin(frame * 0.05 + i * 0.5) * 6;
              return (
                <div
                  key={i}
                  style={{
                    width: isVertical ? 4 : 5,
                    height: Math.max(6, h),
                    borderRadius: 3,
                    backgroundColor: isRecording
                      ? ['#FF6B6B', '#FDE047', '#6EE7B7', '#7DD3FC', '#C4B5FD'][i % 5]
                      : 'rgba(255,255,255,0.2)',
                  }}
                />
              );
            })}
          </div>

          {/* Countdown or status */}
          {isRecording && (
            <div
              style={{
                fontSize: isVertical ? 48 : 60,
                fontWeight: 900,
                color: '#FDE047',
                fontFamily: "'Space Grotesk', monospace",
              }}
            >
              {countdownNum}s
            </div>
          )}

          {isIdentifying && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '3px solid #FDE047',
                  borderTopColor: 'transparent',
                  transform: `rotate(${frame * 8}deg)`,
                }}
              />
              <span
                style={{
                  fontSize: isVertical ? 22 : 26,
                  fontWeight: 700,
                  color: '#FDE047',
                }}
              >
                Searching 100M+ songs...
              </span>
            </div>
          )}

          {/* Progress bar */}
          <div
            style={{
              width: isVertical ? 400 : 600,
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressWidth}%`,
                height: '100%',
                borderRadius: 3,
                background: 'linear-gradient(90deg, #FF6B6B, #FDE047, #6EE7B7)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Matched State — Result Card */}
      {isMatched && (
        <div
          style={{
            opacity: cardOpacity,
            transform: `scale(${cardScale})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: isVertical ? 24 : 28,
            maxWidth: isVertical ? 900 : 1200,
            padding: isVertical ? '0 40px' : '0 60px',
          }}
        >
          {/* Success badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 20px',
              borderRadius: 100,
              backgroundColor: '#6EE7B7',
              border: '2.5px solid #000',
              boxShadow: '3px 3px 0px #000',
            }}
          >
            <span style={{ fontSize: 20 }}>🎯</span>
            <span
              style={{
                fontSize: isVertical ? 18 : 20,
                fontWeight: 900,
                color: '#000',
                letterSpacing: '0.05em',
              }}
            >
              TUNE SPOTTED!
            </span>
          </div>

          {/* Song card */}
          <div
            style={{
              display: 'flex',
              flexDirection: isVertical ? 'column' : 'row',
              alignItems: 'center',
              gap: isVertical ? 20 : 32,
              backgroundColor: '#C4B5FD',
              padding: isVertical ? 28 : 32,
              borderRadius: 24,
              border: '3px solid #000',
              boxShadow: '6px 6px 0px #000',
              width: '100%',
            }}
          >
            {/* Album art placeholder */}
            <div
              style={{
                width: isVertical ? 140 : 160,
                height: isVertical ? 140 : 160,
                borderRadius: 16,
                backgroundColor: '#8B5CF6',
                border: '2px solid #000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: isVertical ? 48 : 56 }}>🎵</span>
            </div>

            {/* Song info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: isVertical ? 16 : 18,
                  fontWeight: 800,
                  color: '#000',
                  opacity: 0.6,
                  margin: 0,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                1ST MATCH • 98% CONFIDENCE
              </p>
              <h2
                style={{
                  fontSize: isVertical ? 44 : 56,
                  fontWeight: 900,
                  color: '#000',
                  margin: '8px 0 4px 0',
                  lineHeight: 1.1,
                }}
              >
                Tum Hi Ho
              </h2>
              <p
                style={{
                  fontSize: isVertical ? 24 : 28,
                  fontWeight: 700,
                  color: 'rgba(0,0,0,0.6)',
                  margin: 0,
                }}
              >
                Arijit Singh • Aashiqui 2
              </p>
            </div>
          </div>

          {/* Streaming links */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { name: 'YouTube Music', bg: '#DC2626', textColor: '#fff', delay: 0 },
              { name: 'Spotify', bg: '#1DB954', textColor: '#000', delay: 3 },
              { name: 'Apple Music', bg: '#E11D48', textColor: '#fff', delay: 6 },
              { name: 'JioSaavn', bg: '#00D8F6', textColor: '#000', delay: 9 },
            ].map((platform) => (
              <div
                key={platform.name}
                style={{
                  opacity: linksFade(platform.delay),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 12,
                  backgroundColor: platform.bg,
                  border: '2px solid #000',
                  boxShadow: '2px 2px 0px #000',
                  fontSize: isVertical ? 16 : 18,
                  fontWeight: 900,
                  color: platform.textColor,
                }}
              >
                {platform.name}
                <span style={{ fontSize: 14 }}>↗</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
