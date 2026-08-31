import React from 'react';
import { MessageSquarePlus, Mic } from 'lucide-react';
import { playPop } from '../utils/audio';

interface HeaderProps {
  onOpenFeedback: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFeedback, onReset }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#FAF7F2]/90 backdrop-blur-lg border-b-[2.5px] border-black px-4 sm:px-8 py-3 transition-all">
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
            <div className="flex items-center gap-0.5 h-6">
              <span className="w-1 bg-[#FF6B6B] rounded-full h-3 wave-bar-1" />
              <span className="w-1 bg-[#FDE047] rounded-full h-5 wave-bar-2" />
              <span className="w-1 bg-[#6EE7B7] rounded-full h-4 wave-bar-3" />
              <span className="w-1 bg-[#7DD3FC] rounded-full h-6 wave-bar-4" />
              <span className="w-1 bg-[#C4B5FD] rounded-full h-3 wave-bar-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-tight text-black flex items-center gap-1.5">
              FineTune
            </span>
            <span className="hidden sm:block text-[10px] font-bold text-zinc-500 tracking-wider uppercase">
              Hum to Discover
            </span>
          </div>
        </button>

        {/* Center Tagline — Desktop */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border-2 border-black/10 shadow-[1px_1px_0px_rgba(0,0,0,0.06)]">
          <Mic className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-500 tracking-tight">
            Hum a tune, find it on YouTube Music &amp; Spotify
          </span>
        </div>

        {/* Top-Right CTA */}
        <div className="flex items-center gap-3">
          <button
            id="give-feedback-btn"
            onClick={() => {
              playPop(480);
              onOpenFeedback();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#FF6B6B] text-black font-bold text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">FEEDBACK</span>
          </button>
        </div>
      </div>
    </header>
  );
};
