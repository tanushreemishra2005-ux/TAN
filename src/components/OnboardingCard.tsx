import React, { useState } from 'react';
import { Mic, ShieldCheck, Sparkles, Headphones } from 'lucide-react';
import { playPop, playChime } from '../utils/audio';

interface OnboardingCardProps {
  onPermissionGranted: (stream: MediaStream | null) => void;
  onSimulateInstead: () => void;
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  onPermissionGranted,
  onSimulateInstead,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRequestMic = async () => {
    playPop(600);
    setIsRequesting(true);
    setErrorMsg(null);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        playChime();
        onPermissionGranted(stream);
      } else {
        onPermissionGranted(null);
      }
    } catch (err: unknown) {
      console.warn('Microphone permission info:', err);
      setErrorMsg('Microphone blocked — continuing with demo mode!');
      setTimeout(() => {
        onPermissionGranted(null);
      }, 1000);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-fade-in">
      {/* Main Card */}
      <div className="w-full bg-white rounded-3xl neo-box-lg p-8 sm:p-10 relative overflow-hidden flex flex-col items-center text-center">
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Microphone Hero Graphic — Refined */}
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FDE047]/30 to-[#6EE7B7]/30 border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_#000] relative animate-float">
            {/* Inner circle */}
            <div className="w-24 h-24 rounded-full bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Mic className="w-10 h-10 text-black stroke-[2]" />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full border-2 border-[#FF6B6B]/40 animate-pulse-ring" />
          </div>
          {/* Floating accent stickers */}
          <div className="absolute -top-2 -right-4 p-1.5 bg-[#FF6B6B] rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] rotate-12 hidden sm:block">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-4 p-1.5 bg-[#C4B5FD] rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] -rotate-12 hidden sm:block">
            <Headphones className="w-4 h-4 text-black" />
          </div>
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl sm:text-3xl font-black text-black font-display mb-2 tracking-tight">
          Hum it. Find it.
        </h2>
        <p className="text-sm font-semibold text-zinc-500 max-w-sm mb-8 leading-relaxed">
          Sing, hum, or whistle any song — we'll identify it instantly on YouTube Music, Spotify, and 20+ streaming platforms.
        </p>

        {/* Big Action Button */}
        <button
          id="enable-microphone-btn"
          onClick={handleRequestMic}
          disabled={isRequesting}
          className="w-full sm:w-auto px-8 py-4 bg-[#FF6B6B] hover:bg-[#ff5555] text-black font-black text-base rounded-2xl border-[3px] border-black shadow-[5px_5px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] transition-all flex items-center justify-center gap-3 cursor-pointer group"
        >
          <Mic className="w-5 h-5 text-black stroke-[2.5] group-hover:rotate-12 transition-transform" />
          <span>{isRequesting ? 'CONNECTING...' : 'ENABLE MICROPHONE'}</span>
        </button>

        {/* Error / Fallback Banner */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-[#FDE047] text-black border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_#000] animate-slide-up">
            {errorMsg}
          </div>
        )}

        {/* Privacy Note & Demo */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-bold text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% Private. Audio stays on your device.
          </span>
          <span className="hidden sm:inline text-zinc-300">•</span>
          <button
            onClick={() => {
              playPop(440);
              onSimulateInstead();
            }}
            className="text-black/60 hover:text-black underline underline-offset-2 font-extrabold cursor-pointer transition-colors"
          >
            Try a quick demo instead
          </button>
        </div>
      </div>
    </div>
  );
};
