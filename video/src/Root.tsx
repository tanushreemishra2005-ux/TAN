import React from 'react';
import { Composition } from 'remotion';
import { FineTuneLaunch } from './FineTuneLaunch';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FineTuneLaunchAny = FineTuneLaunch as any;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Landscape — 16:9 — YouTube / X / LinkedIn */}
      <Composition
        id="FineTuneLaunch"
        component={FineTuneLaunchAny}
        durationInFrames={750}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ orientation: 'landscape' as const }}
      />
      {/* Vertical — 9:16 — YouTube Shorts / TikTok / Reels */}
      <Composition
        id="FineTuneLaunchVertical"
        component={FineTuneLaunchAny}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ orientation: 'vertical' as const }}
      />
    </>
  );
};
