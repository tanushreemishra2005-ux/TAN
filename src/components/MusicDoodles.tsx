import React from 'react';
import { Music, Disc, Sparkles, Zap, Radio, Volume2, Heart } from 'lucide-react';
import { playPop } from '../utils/audio';

export const MusicDoodles: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Top-Left Floating Sticker: Vinyl Record */}
      <div
        onClick={() => playPop(520)}
        className="pointer-events-auto absolute top-24 left-4 sm:left-10 p-3 bg-[#FDE047] rounded-2xl border-[2.5px] border-black shadow-[3px_3px_0px_#000] rotate-[-12deg] hover:rotate-0 hover:scale-110 transition-all cursor-pointer hidden lg:flex items-center gap-2"
      >
        <Disc className="w-5 h-5 text-black animate-spin" style={{ animationDuration: '6s' }} />
        <span className="text-xs font-black text-black">DESI BEATS</span>
      </div>

      {/* Top-Right Floating Sticker: 20+ Languages */}
      <div
        onClick={() => playPop(560)}
        className="pointer-events-auto absolute top-28 right-4 sm:right-12 p-3 bg-[#6EE7B7] rounded-2xl border-[2.5px] border-black shadow-[3px_3px_0px_#000] rotate-[8deg] hover:rotate-0 hover:scale-110 transition-all cursor-pointer hidden lg:flex items-center gap-2"
      >
        <Zap className="w-5 h-5 text-black fill-yellow-400" />
        <span className="text-xs font-black text-black">HUM &amp; SPOT 🎯</span>
      </div>

      {/* Bottom-Left Floating Sticker: Retro Speaker Graphic */}
      <div
        onClick={() => playPop(480)}
        className="pointer-events-auto absolute bottom-12 left-6 p-3 bg-[#FF6B6B] rounded-2xl border-[2.5px] border-black shadow-[3px_3px_0px_#000] rotate-[6deg] hover:rotate-0 hover:scale-110 transition-all cursor-pointer hidden xl:flex items-center gap-2"
      >
        <div className="w-8 h-10 rounded-lg bg-zinc-900 border border-black flex flex-col items-center justify-around p-1">
          <div className="w-4 h-4 rounded-full bg-zinc-600 border border-white/40" />
          <div className="w-6 h-6 rounded-full bg-zinc-700 border border-white/40" />
        </div>
        <div className="text-left">
          <span className="text-[10px] font-black uppercase text-black block">SURILA SOUND</span>
          <span className="text-xs font-black text-white">DOLBY DESI</span>
        </div>
      </div>

      {/* Bottom-Right Floating Sticker: Reel Star */}
      <div
        onClick={() => playPop(620)}
        className="pointer-events-auto absolute bottom-12 right-6 p-3 bg-[#C4B5FD] rounded-2xl border-[2.5px] border-black shadow-[3px_3px_0px_#000] rotate-[-8deg] hover:rotate-0 hover:scale-110 transition-all cursor-pointer hidden xl:flex items-center gap-2"
      >
        <Sparkles className="w-5 h-5 text-black fill-yellow-300" />
        <span className="text-xs font-black text-black">KARAOKE &amp; REELS</span>
      </div>
    </div>
  );
};
