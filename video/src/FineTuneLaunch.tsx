import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { HookScene } from './scenes/HookScene';
import { RevealScene } from './scenes/RevealScene';
import { DemoScene } from './scenes/DemoScene';
import { FeaturesScene } from './scenes/FeaturesScene';
import { EndcardScene } from './scenes/EndcardScene';

interface FineTuneLaunchProps {
  orientation: 'landscape' | 'vertical';
}

/**
 * FineTune Product Launch Video — 25s (750 frames @ 30fps)
 *
 * Structure:
 *   1. Hook (0-3s)     — lead with the viewer's problem
 *   2. Reveal (3-6s)   — product name + tagline
 *   3. Demo (6-15s)    — the money shot: hum → identify → listen
 *   4. Features (15-21s) — key capabilities
 *   5. Endcard (21-25s) — branding + CTA
 */
export const FineTuneLaunch: React.FC<FineTuneLaunchProps> = ({ orientation }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const isVertical = orientation === 'vertical';

  // Scene timing in frames
  const HOOK_START = 0;
  const HOOK_END = 3 * fps;       // 90
  const REVEAL_START = HOOK_END;
  const REVEAL_END = 6 * fps;     // 180
  const DEMO_START = REVEAL_END;
  const DEMO_END = 15 * fps;      // 450
  const FEATURES_START = DEMO_END;
  const FEATURES_END = 21 * fps;  // 630
  const ENDCARD_START = FEATURES_END;
  const ENDCARD_END = durationInFrames;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FAF7F2',
        fontFamily: "'Plus Jakarta Sans', 'Cabinet Grotesk', system-ui, sans-serif",
      }}
    >
      {/* Global gradient overlay that shifts across scenes */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${interpolate(frame, [0, durationInFrames], [135, 315], { extrapolateRight: 'clamp' })}deg, rgba(255,107,107,0.03), rgba(253,224,71,0.03), rgba(110,231,183,0.03))`,
        }}
      />

      {/* Scene 1: Hook */}
      <Sequence from={HOOK_START} durationInFrames={HOOK_END - HOOK_START}>
        <HookScene isVertical={isVertical} />
      </Sequence>

      {/* Scene 2: Product Reveal */}
      <Sequence from={REVEAL_START} durationInFrames={REVEAL_END - REVEAL_START}>
        <RevealScene isVertical={isVertical} />
      </Sequence>

      {/* Scene 3: Demo */}
      <Sequence from={DEMO_START} durationInFrames={DEMO_END - DEMO_START}>
        <DemoScene isVertical={isVertical} />
      </Sequence>

      {/* Scene 4: Features */}
      <Sequence from={FEATURES_START} durationInFrames={FEATURES_END - FEATURES_START}>
        <FeaturesScene isVertical={isVertical} />
      </Sequence>

      {/* Scene 5: Endcard */}
      <Sequence from={ENDCARD_START} durationInFrames={ENDCARD_END - ENDCARD_START}>
        <EndcardScene isVertical={isVertical} />
      </Sequence>
    </AbsoluteFill>
  );
};
