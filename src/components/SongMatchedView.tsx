import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Music2, Disc, Play, Pause, Volume2, ArrowRight } from 'lucide-react';
import { Song } from '../types';
import { playPop, synthPlayer } from '../utils/audio';

interface SongMatchedViewProps {
  bestMatch: Song;
  alternative1: Song;
  alternative2: Song;
  activeSong: Song;
  onSelectSong: (song: Song) => void;
  onOpenListen: () => void;
  onOpenKaraoke: () => void;
  onOpenReel: () => void;
}

export const SongMatchedView: React.FC<SongMatchedViewProps> = ({
  bestMatch,
  alternative1,
  alternative2,
  activeSong,
  onSelectSong,
  onOpenListen,
  onOpenKaraoke,
  onOpenReel,
}) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);

  const togglePreview = (song: Song) => {
    playPop(520);
    if (isPlayingPreview) {
      synthPlayer.stop();
      setIsPlayingPreview(false);
      setPreviewProgress(0);
    } else {
      setIsPlayingPreview(true);
      synthPlayer.playSong(
        song,
        'guide',
        0,
        (time, dur) => {
          setPreviewProgress((time / dur) * 100);
        },
        () => {
          setIsPlayingPreview(false);
          setPreviewProgress(0);
        }
      );
    }
  };

  const matches = [
    {
      song: bestMatch,
      label: '1st Match',
      badge: 'BEST MATCH!',
      badgeBg: 'bg-[#FDE047]',
      cardBg: 'bg-[#C4B5FD]', // Soft Lavender
      borderAccent: 'border-violet-600',
      confidence: bestMatch.confidence || 98,
      isPrimary: true,
    },
    {
      song: alternative1,
      label: 'Alternative 1',
      badge: 'SIMILAR TUNE',
      badgeBg: 'bg-[#7DD3FC]',
      cardBg: 'bg-[#FDE047]', // Sunny Yellow
      borderAccent: 'border-amber-600',
      confidence: alternative1.confidence || 84,
      isPrimary: false,
    },
    {
      song: alternative2,
      label: 'Alternative 2',
      badge: 'SIMILAR TUNE',
      badgeBg: 'bg-[#FF6B6B]',
      cardBg: 'bg-[#6EE7B7]', // Pastel Mint
      borderAccent: 'border-emerald-600',
      confidence: alternative2.confidence || 72,
      isPrimary: false,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Top Success Badge */}
      <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#6EE7B7] border-[2.5px] border-black shadow-[3px_3px_0px_#000] mb-5 animate-bounce">
        <Sparkles className="w-4 h-4 text-black fill-yellow-400" />
        <span className="text-sm sm:text-base font-black tracking-wide text-black uppercase">
          TUNE SPOTTED! 🎯
        </span>
      </div>

      {/* Screen Title */}
      <div className="flex items-center justify-between w-full mb-4 px-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-black text-black font-display uppercase tracking-tight">
            SONG MATCHED ({matches.length} Results)
          </h2>
        </div>
        <span className="text-xs font-black text-zinc-600 bg-white px-3 py-1 rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
          Click card to select
        </span>
      </div>

      {/* 3 Matched Cards Grid / Carousel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
        {matches.map(({ song, label, badge, badgeBg, cardBg, confidence, isPrimary }) => {
          const isSelected = activeSong.id === song.id;

          return (
            <div
              key={song.id}
              onClick={() => {
                playPop(480);
                onSelectSong(song);
                if (isPlayingPreview && activeSong.id !== song.id) {
                  synthPlayer.stop();
                  setIsPlayingPreview(false);
                }
              }}
              className={`rounded-2xl p-5 border-[3px] border-black transition-all cursor-pointer relative flex flex-col justify-between ${cardBg} ${
                isSelected
                  ? 'shadow-[6px_6px_0px_#000] translate-x-[-2px] translate-y-[-2px] ring-4 ring-black/20'
                  : 'shadow-[3px_3px_0px_#000] hover:shadow-[5px_5px_0px_#000] hover:translate-y-[-2px]'
              }`}
            >
              {/* Card Header: 1st Match / Alternative + Confidence Badge */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono-retro font-black text-xs uppercase px-2 py-0.5 rounded-md bg-white border border-black text-black">
                      {label}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-black fill-white" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-black text-black ${badgeBg} shadow-[1px_1px_0px_#000]`}
                  >
                    {badge} • {confidence}%
                  </span>
                </div>

                {/* Album Artwork & Details */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-black mb-3.5 bg-zinc-900 group">
                  <img
                    src={song.artworkUrl}
                    alt={song.titleEng}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle Vinyl Disc Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-black text-[#FDE047] uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded border border-[#FDE047]/40">
                        {song.movieOrAlbum}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePreview(song);
                        }}
                        className="w-8 h-8 rounded-full bg-white text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        title="Listen to melody preview"
                      >
                        {isPlayingPreview && activeSong.id === song.id ? (
                          <Pause className="w-4 h-4 fill-black" />
                        ) : (
                          <Play className="w-4 h-4 fill-black translate-x-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Song Title (Bilingual) */}
                <div className="mb-2">
                  <span className="text-[11px] font-bold text-zinc-700 block uppercase">
                    Song Title ({song.movieOrAlbum})
                  </span>
                  <h3 className="text-lg font-black text-black font-display tracking-tight leading-snug">
                    {song.titleEng} | {song.titleNative}
                  </h3>
                </div>

                {/* Artist and Language tags */}
                <div className="space-y-0.5 text-xs font-bold text-zinc-800">
                  <p className="truncate">
                    <span className="text-zinc-600 font-semibold">Artist:</span> {song.artist}
                  </p>
                  <p>
                    <span className="text-zinc-600 font-semibold">Original language:</span> {song.originalLang}
                  </p>
                </div>
              </div>

              {/* Selection indicator pill */}
              <div className="mt-4 pt-3 border-t-2 border-black/20 flex items-center justify-between">
                <span className="text-[11px] font-black text-black">
                  {isSelected ? '✓ ACTIVE SELECTION' : 'Tap to focus'}
                </span>
                <span className="font-mono-retro font-bold text-xs">
                  {confidence}% MATCH
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini preview audio scrubber if playing */}
      {isPlayingPreview && (
        <div className="w-full mt-4 p-3 bg-white rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black text-black">
              PLAYING MELODIC STEM: {activeSong.titleEng}
            </span>
          </div>
          <div className="flex-1 bg-zinc-200 h-2 rounded-full overflow-hidden border border-black">
            <div
              className="bg-[#FF6B6B] h-full transition-all duration-100"
              style={{ width: `${previewProgress}%` }}
            />
          </div>
          <button
            onClick={() => togglePreview(activeSong)}
            className="text-xs font-black px-2.5 py-1 rounded bg-[#FDE047] border border-black cursor-pointer"
          >
            Stop
          </button>
        </div>
      )}

      {/* Screen 4: WHAT'S NEXT? Action Modes */}
      <div className="w-full mt-8 rounded-3xl bg-[#FF6B6B] border-[3px] border-black p-6 sm:p-8 shadow-[6px_6px_0px_#000]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-black bg-white px-3 py-1 rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
              NOW PLAYING • {activeSong.titleEng}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display mt-2 tracking-tight drop-shadow-[1.5px_1.5px_0px_#000]">
              WHAT'S NEXT?
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-bold text-zinc-900 bg-[#FDE047] px-3.5 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] max-w-xs">
            Choose your next vibe with <b>{activeSong.titleEng}</b>!
          </p>
        </div>

        {/* 3 Prominent Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: 🎧 LISTEN NOW (Coral Theme / White Card) */}
          <div
            onClick={() => {
              playPop(550);
              onOpenListen();
            }}
            className="rounded-2xl bg-white border-[2.5px] border-black p-5 shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-black text-lg text-black uppercase">
                  LISTEN NOW
                </span>
                <span className="text-xl">🎧</span>
              </div>

              {/* Streaming Platform Icons Pill */}
              <div className="flex items-center justify-center gap-3 py-5 bg-[#FAF7F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] mb-4">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center border-2 border-black shadow-[1.5px_1.5px_0px_#000] group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center border-2 border-black shadow-[1.5px_1.5px_0px_#000] group-hover:scale-110 transition-transform">
                  <Music2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="w-10 h-10 rounded-full bg-[#00D8F6] text-black flex items-center justify-center border-2 border-black shadow-[1.5px_1.5px_0px_#000] group-hover:scale-110 transition-transform">
                  <Disc className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              <p className="text-xs font-bold text-zinc-600 mb-2 leading-relaxed">
                Stream on YouTube Music, Spotify, Apple Music, and JioSaavn with built-in player.
              </p>
            </div>

            <div className="mt-2 flex items-center justify-between pt-3 border-t border-zinc-200">
              <span className="text-xs font-black text-black group-hover:underline">
                OPEN STREAMING
              </span>
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: 🎤 KARAOKE ROOM (Yellow Card) */}
          <div
            onClick={() => {
              playPop(580);
              onOpenKaraoke();
            }}
            className="rounded-2xl bg-[#FDE047] border-[2.5px] border-black p-5 shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-black text-lg text-black uppercase">
                  KARAOKE
                </span>
                <span className="text-xl">🎤</span>
              </div>

              {/* Teleprompter graphic */}
              <div className="flex flex-col items-center justify-center py-4 px-2 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] mb-4">
                <div className="w-full text-center">
                  <span className="text-[10px] font-mono-retro font-black uppercase text-amber-600 bg-amber-100 px-2 py-0.5 rounded border border-amber-400">
                    Devanagari + English
                  </span>
                  <p className="text-sm font-black text-black mt-1">
                    {activeSong.lyrics[0]?.textNative || 'हम तेरे बिन...'}
                  </p>
                  <p className="text-xs font-bold text-zinc-500 italic">
                    {activeSong.lyrics[0]?.textEng || 'Hum tere bin ab...'}
                  </p>
                </div>
              </div>

              <p className="text-xs font-bold text-zinc-800 mb-2 leading-relaxed">
                Sing with synchronized bilingual lyrics, pitch shifting, and real-time mic score tracker!
              </p>
            </div>

            <div className="mt-2 flex items-center justify-between pt-3 border-t border-black/20">
              <span className="text-xs font-black text-black group-hover:underline">
                ENTER KARAOKE
              </span>
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: 🎬 REEL / CREATE VIDEO (Mint Card) */}
          <div
            onClick={() => {
              playPop(620);
              onOpenReel();
            }}
            className="rounded-2xl bg-[#6EE7B7] border-[2.5px] border-black p-5 shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-black text-lg text-black uppercase">
                  REEL / VIDEO
                </span>
                <span className="text-xl">🎬</span>
              </div>

              {/* Video Camera filter graphic */}
              <div className="flex items-center justify-center py-4 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FF6B6B] border border-black flex items-center justify-center text-xs font-black">
                    VHS
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-[#FDE047] border border-black flex items-center justify-center text-xs font-black">
                    ✨
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-[#7DD3FC] border border-black flex items-center justify-center text-xs font-black">
                    GLOW
                  </div>
                </div>
              </div>

              <p className="text-xs font-bold text-zinc-800 mb-2 leading-relaxed">
                Attach the 15-second snippet, turn on camera with Sparkles/Retro VHS filters, and record mock Reels!
              </p>
            </div>

            <div className="mt-2 flex items-center justify-between pt-3 border-t border-black/20">
              <span className="text-xs font-black text-black group-hover:underline">
                CREATE REEL
              </span>
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
