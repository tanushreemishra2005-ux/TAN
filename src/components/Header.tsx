import React from 'react';
import { Activity, MessageSquarePlus, Sparkles } from 'lucide-react';
import { playPop } from '../utils/audio';

interface HeaderProps {
  onOpenFeedback: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFeedback, onReset }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b-[2.5px] border-black px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          id="brand-logo-btn"
          onClick={() => {
            playPop(520);
            onReset();
          }}
          className="group flex items-center gap-2.5 text-left cursor-pointer focus:outline-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-black text-white neo-box-sm group-hover:scale-105 transition-transform">
            {/* Multi-color soundwave icon */}
            <div className="flex items-center gap-0.5 h-6">
              <span className="w-1 bg-[#FF6B6B] rounded-full h-3 wave-bar-1" />
              <span className="w-1 bg-[#FDE047] rounded-full h-5 wave-bar-2" />
              <span className="w-1 bg-[#6EE7B7] rounded-full h-4 wave-bar-3" />
              <span className="w-1 bg-[#7DD3FC] rounded-full h-6 wave-bar-4" />
              <span className="w-1 bg-[#C4B5FD] rounded-full h-3 wave-bar-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-2xl tracking-tight text-black flex items-center gap-1.5">
              FineTune
              <span className="inline-block w-2 h-2 rounded-full bg-[#FF6B6B] border border-black animate-pulse" />
            </span>
            <span className="hidden sm:block text-[11px] font-bold text-zinc-500 tracking-wider uppercase">
              YouTube Music &amp; Spotify AI Finder
            </span>
          </div>
        </button>

        {/* Center Tagline */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span className="text-sm font-bold text-zinc-800 tracking-tight">
            Hum it in English or 12+ Indic languages. Find it instantly.
          </span>
          <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-[#1DB954] text-black border border-black">
            Spotify &amp; YT Music
          </span>
        </div>

        {/* Top-Right CTA: Give Feedback */}
        <div className="flex items-center gap-3">
          <button
            id="give-feedback-btn"
            onClick={() => {
              playPop(480);
              onOpenFeedback();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] hover:bg-[#ff5757] text-black font-extrabold text-sm rounded-xl border-[2.5px] border-black shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4 text-black stroke-[2.5]" />
            <span>GIVE FEEDBACK</span>
            <span className="font-mono-retro font-bold text-base">↗</span>
          </button>
        </div>
      </div>
    </header>
  );
};
