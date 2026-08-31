import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Music2, Play, Pause, ExternalLink, ArrowRight, Youtube } from 'lucide-react';
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
      badge: bestMatch.badgeLabel || 'BEST MATCH!',
      badgeBg: 'bg-[#FDE047]',
      cardBg: 'bg-[#C4B5FD]',
      confidence: bestMatch.confidence || 98,
      isPrimary: true,
    },
    {
      song: alternative1,
      label: 'Alternative',
      badge: alternative1.badgeLabel || 'SIMILAR',
      badgeBg: 'bg-[#7DD3FC]',
      cardBg: 'bg-[#FDE047]',
      confidence: alternative1.confidence || 84,
      isPrimary: false,
    },
    {
      song: alternative2,
      label: 'Alternative',
      badge: alternative2.badgeLabel || 'SIMILAR',
      badgeBg: 'bg-[#FF6B6B]',
      cardBg: 'bg-[#6EE7B7]',
      confidence: alternative2.confidence || 72,
      isPrimary: false,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center animate-fade-in">
      {/* Success Badge */}
      <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#6EE7B7] border-[2.5px] border-black shadow-[3px_3px_0px_#000] mb-5 animate-slide-up">
        <Sparkles className="w-4 h-4 text-black fill-yellow-400" />
        <span className="text-sm sm:text-base font-black tracking-wide text-black uppercase">
          TUNE SPOTTED! 🎯
        </span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between w-full mb-4 px-1">
        <h2 className="text-xl sm:text-2xl font-black text-black font-display tracking-tight">
          {matches.length} Match{matches.length > 1 ? 'es' : ''}
        </h2>
        <span className="text-[11px] font-bold text-zinc-500">
          Tap a card to select
        </span>
      </div>

      {/* Matched Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
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
              className={`rounded-2xl p-4 border-[2.5px] border-black transition-all cursor-pointer relative flex flex-col justify-between ${cardBg} ${
                isSelected
                  ? 'shadow-[5px_5px_0px_#000] translate-x-[-1px] translate-y-[-1px] ring-3 ring-black/15'
                  : 'shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-y-[-2px]'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono-retro font-black text-[10px] uppercase px-2 py-0.5 rounded-md bg-white/80 border border-black/20 text-black">
                      {label}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-black fill-white" />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border border-black text-black ${badgeBg}`}
                  >
                    {confidence}%
                  </span>
                </div>

                {/* Album Artwork */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-black mb-3 bg-zinc-900 group">
                  <img
                    src={song.artworkUrl}
                    alt={song.titleEng}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-black text-[#FDE047] uppercase tracking-wider bg-black/50 px-2 py-0.5 rounded border border-[#FDE047]/30">
                        {song.movieOrAlbum}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePreview(song);
                        }}
                        className="w-8 h-8 rounded-full bg-white text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        title="Preview melody"
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

                {/* Song Info */}
                <div className="mb-2">
                  <h3 className="text-base font-black text-black font-display tracking-tight leading-snug">
                    {song.titleEng}
                  </h3>
                  {song.titleNative !== song.titleEng && (
                    <p className="text-xs font-semibold text-black/60 mt-0.5">{song.titleNative}</p>
                  )}
                </div>

                <div className="space-y-0.5 text-[11px] font-semibold text-zinc-700">
                  <p className="truncate">{song.artist}</p>
                  <p className="text-zinc-500">{song.originalLang}</p>
                </div>

                {/* Inline Streaming Links */}
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {song.youtubeMusicUrl && (
                    <a
                      href={song.youtubeMusicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black border border-black/20 hover:bg-red-700 transition-colors"
                    >
                      <Youtube className="w-3 h-3" />
                      <span>YouTube Music</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {song.spotifyUrl && (
                    <a
                      href={song.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1DB954] text-black text-[10px] font-black border border-black/20 hover:bg-[#19a34a] transition-colors"
                    >
                      <Music2 className="w-3 h-3" />
                      <span>Spotify</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {song.appleMusicUrl && (
                    <a
                      href={song.appleMusicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[10px] font-black border border-black/20 hover:opacity-90 transition-opacity"
                    >
                      <span>🍎</span>
                      <span>Apple</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Selection indicator */}
              <div className="mt-3 pt-2 border-t-2 border-black/15 flex items-center justify-between">
                <span className="text-[10px] font-black text-black">
                  {isSelected ? '✓ SELECTED' : 'Tap to select'}
                </span>
                <span className="font-mono-retro font-bold text-[10px]">
                  {badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audio Scrubber */}
      {isPlayingPreview && (
        <div className="w-full mt-4 p-3 bg-white rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-3 animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-black text-black truncate max-w-[200px]">
              {activeSong.titleEng}
            </span>
          </div>
          <div className="flex-1 bg-zinc-200 h-1.5 rounded-full overflow-hidden border border-black">
            <div
              className="bg-[#FF6B6B] h-full transition-all duration-100"
              style={{ width: `${previewProgress}%` }}
            />
          </div>
          <button
            onClick={() => togglePreview(activeSong)}
            className="text-[10px] font-black px-2 py-0.5 rounded bg-[#FDE047] border border-black cursor-pointer"
          >
            Stop
          </button>
        </div>
      )}

      {/* Action Cards */}
      <div className="w-full mt-8 rounded-3xl bg-[#FF6B6B] border-[3px] border-black p-5 sm:p-7 shadow-[5px_5px_0px_#000]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-black/70 bg-white/60 px-2.5 py-0.5 rounded-full border border-black/10">
              NOW PLAYING
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-1 tracking-tight drop-shadow-[1px_1px_0px_rgba(0,0,0,0.3)]">
              {activeSong.titleEng}
            </h2>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Listen Now */}
          <div
            onClick={() => { playPop(550); onOpenListen(); }}
            className="rounded-2xl bg-white border-[2.5px] border-black p-4 shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-black text-base text-black uppercase">
                LISTEN NOW
              </span>
              <span className="text-lg">🎧</span>
            </div>
            <div className="flex items-center gap-2 py-3 bg-[#FAF7F2] rounded-xl border border-black/10 mb-3">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center border border-black/20 group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4 fill-white" />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#1DB954] text-black flex items-center justify-center border border-black/20 group-hover:scale-105 transition-transform">
                <Music2 className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <p className="text-[11px] font-semibold text-zinc-600 mb-2 leading-relaxed">
              Stream on YouTube Music, Spotify, Apple Music, and JioSaavn.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
              <span className="text-[11px] font-black text-black group-hover:underline">
                OPEN PLAYER
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-black group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Karaoke */}
          <div
            onClick={() => { playPop(580); onOpenKaraoke(); }}
            className="rounded-2xl bg-[#FDE047] border-[2.5px] border-black p-4 shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-black text-base text-black uppercase">
                KARAOKE
              </span>
              <span className="text-lg">🎤</span>
            </div>
            <div className="flex flex-col items-center justify-center py-3 px-2 bg-white rounded-xl border border-black/10 mb-3">
              <p className="text-sm font-black text-black text-center">
                {activeSong.lyrics[0]?.textNative || 'हम तेरे बिन...'}
              </p>
              <p className="text-[10px] font-semibold text-zinc-500 italic text-center mt-0.5">
                {activeSong.lyrics[0]?.textEng || 'Hum tere bin ab...'}
              </p>
            </div>
            <p className="text-[11px] font-semibold text-zinc-800 mb-2 leading-relaxed">
              Sing along with synchronized lyrics, pitch shifting, and mic scoring.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-black/15">
              <span className="text-[11px] font-black text-black group-hover:underline">
                ENTER KARAOKE
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-black group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Reel / Video */}
          <div
            onClick={() => { playPop(620); onOpenReel(); }}
            className="rounded-2xl bg-[#6EE7B7] border-[2.5px] border-black p-4 shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-black text-base text-black uppercase">
                CREATE REEL
              </span>
              <span className="text-lg">🎬</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-3 bg-white rounded-xl border border-black/10 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#FF6B6B] border border-black/20 flex items-center justify-center text-[10px] font-black text-white">
                VHS
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#FDE047] border border-black/20 flex items-center justify-center text-[10px] font-black">
                ✨
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#7DD3FC] border border-black/20 flex items-center justify-center text-[10px] font-black">
                GLOW
              </div>
            </div>
            <p className="text-[11px] font-semibold text-zinc-800 mb-2 leading-relaxed">
              Record a 15-second video reel with music, filters, and camera effects.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-black/15">
              <span className="text-[11px] font-black text-black group-hover:underline">
                CREATE REEL
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-black group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
