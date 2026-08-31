import React, { useState } from 'react';
import { Mic, Headphones, Music, Volume2, ShieldCheck, Sparkles, Radio } from 'lucide-react';
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
        // Fallback for browsers / environments without mediaDevices
        onPermissionGranted(null);
      }
    } catch (err: unknown) {
      console.warn('Microphone permission info:', err);
      // Fallback seamlessly to mock mode with polite informative notice
      setErrorMsg('Microphone blocked or not supported — continuing with simulated mic engine!');
      setTimeout(() => {
        onPermissionGranted(null);
      }, 1000);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Decorative top label */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FDE047] border-2 border-black shadow-[2px_2px_0px_#000] mb-4 rotate-[-1deg]">
        <Radio className="w-3.5 h-3.5 text-black animate-pulse" />
        <span className="text-xs font-black tracking-wider uppercase">ASK PERMISSION</span>
      </div>

      {/* Main Neo-Brutalist Card */}
      <div className="w-full bg-white rounded-3xl neo-box-lg p-6 sm:p-10 relative overflow-hidden flex flex-col items-center text-center">
        {/* Floating stickers around card */}
        <div className="absolute top-4 left-4 p-2 bg-[#6EE7B7] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] rotate-[-12deg] hidden sm:block">
          <Music className="w-5 h-5 text-black" />
        </div>
        <div className="absolute top-4 right-4 p-2 bg-[#C4B5FD] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] rotate-[12deg] hidden sm:block">
          <Sparkles className="w-5 h-5 text-black" />
        </div>

        {/* Animated Retro Microphone Graphic with Headphones */}
        <div className="relative my-2">
          {/* Headphones ring */}
          <div className="w-36 h-36 rounded-full border-[3.5px] border-black bg-[#FDFBF7] flex items-center justify-center shadow-[4px_4px_0px_#000] relative">
            {/* Top Headphone Arc */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-12 border-t-[5px] border-l-[4px] border-r-[4px] border-black rounded-t-full" />
            {/* Left Ear Cushion */}
            <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-5 h-12 bg-[#FF6B6B] border-[2.5px] border-black rounded-lg shadow-[2px_2px_0px_#000]" />
            {/* Right Ear Cushion */}
            <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-5 h-12 bg-[#FF6B6B] border-[2.5px] border-black rounded-lg shadow-[2px_2px_0px_#000]" />

            {/* Vintage Mic in center */}
            <div className="relative flex flex-col items-center">
              <div className="w-14 h-16 rounded-2xl bg-[#7DD3FC] border-[2.5px] border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group">
                <Mic className="w-8 h-8 text-black stroke-[2.5] animate-bounce" />
              </div>
              <div className="w-2.5 h-4 bg-black" />
              <div className="w-12 h-2.5 bg-black rounded-full" />
            </div>

            {/* Pulsing sound waves */}
            <div className="absolute -bottom-2 right-1 flex items-center gap-1 bg-[#1DB954] px-2 py-0.5 rounded-full border border-black text-[10px] font-black shadow-[1.5px_1.5px_0px_#000] text-black">
              <Volume2 className="w-3 h-3" />
              <span>SPOTIFY &amp; YT</span>
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl sm:text-3xl font-black text-black font-display mt-6 mb-3 tracking-tight">
          FineTune wants to hear your tune!
        </h2>
        <p className="text-base font-semibold text-zinc-600 max-w-md mb-8 leading-relaxed">
          Hum, sing, or whistle English and Indic songs to identify them on YouTube Music and Spotify instantly!
        </p>

        {/* Big Action Button */}
        <button
          id="enable-microphone-btn"
          onClick={handleRequestMic}
          disabled={isRequesting}
          className="w-full sm:w-auto px-8 py-4 bg-[#7DD3FC] hover:bg-[#60c5f7] text-black font-black text-lg rounded-2xl border-[3px] border-black shadow-[5px_5px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] transition-all flex items-center justify-center gap-3 cursor-pointer group"
        >
          <Mic className="w-6 h-6 text-black stroke-[2.5] group-hover:rotate-12 transition-transform" />
          <span>{isRequesting ? 'CONNECTING...' : 'ENABLE MICROPHONE'}</span>
          <span className="font-mono-retro font-black text-xl group-hover:translate-x-1 transition-transform">↗</span>
        </button>

        {/* Error / Fallback Banner if needed */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-[#FDE047] text-black border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_#000] animate-bounce">
            {errorMsg}
          </div>
        )}

        {/* Privacy Note & Quick simulation toggle */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-bold text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% Private. Audio is analyzed on your device.
          </span>
          <span className="hidden sm:inline">•</span>
          <button
            onClick={() => {
              playPop(440);
              onSimulateInstead();
            }}
            className="text-black underline hover:text-indigo-600 font-extrabold cursor-pointer"
          >
            Or try instant humming demo
          </button>
        </div>
      </div>
    </div>
  );
};
