import React, { useState, useEffect } from 'react';
import { X, Play, Pause, ExternalLink, Volume2, RotateCcw, Sparkles, Music, Youtube } from 'lucide-react';
import { Song } from '../types';
import { playPop, synthPlayer } from '../utils/audio';

interface ListenModalProps {
  song: Song;
  onClose: () => void;
}

export const ListenModal: React.FC<ListenModalProps> = ({ song, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(16);
  const [volume, setVolume] = useState(80);

  useEffect(() => {
    // Start audio preview on modal open
    setIsPlaying(true);
    synthPlayer.playSong(
      song,
      'guide',
      0,
      (time, dur) => {
        setCurrentTime(time);
        setDuration(dur);
      },
      () => {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    );

    return () => {
      synthPlayer.stop();
    };
  }, [song]);

  const togglePlay = () => {
    playPop(500);
    if (isPlaying) {
      synthPlayer.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      synthPlayer.playSong(
        song,
        'guide',
        0,
        (time, dur) => {
          setCurrentTime(time);
          setDuration(dur);
        },
        () => {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      );
    }
  };

  const platforms = [
    {
      name: 'YouTube Music',
      url: song.youtubeMusicUrl,
      color: 'bg-red-600 hover:bg-red-700 text-white',
      badge: 'Official Audio + Video',
      icon: '▶',
    },
    {
      name: 'Spotify',
      url: song.spotifyUrl,
      color: 'bg-[#1DB954] hover:bg-[#19a34a] text-black',
      badge: 'Top Streamed',
      icon: '🟢',
    },
    {
      name: 'YouTube',
      url: song.youtubeVideoId
        ? `https://www.youtube.com/watch?v=${song.youtubeVideoId}`
        : `https://www.youtube.com/results?search_query=${encodeURIComponent(song.titleEng + ' ' + song.artist)}`,
      color: 'bg-zinc-900 hover:bg-black text-white',
      badge: 'Watch Video Clip',
      icon: '📺',
    },
    {
      name: 'Apple Music',
      url: song.appleMusicUrl,
      color: 'bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-90 text-white',
      badge: 'Spatial Audio',
      icon: '🍎',
    },
    {
      name: 'JioSaavn',
      url: song.jiosaavnUrl,
      color: 'bg-[#00D8F6] hover:bg-[#00c0db] text-black',
      badge: 'Regional Audio',
      icon: '🎵',
    },
  ];

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl neo-box-lg p-6 sm:p-7 relative overflow-hidden flex flex-col">
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF6B6B] border border-black" />
            <span className="w-3 h-3 rounded-full bg-[#FDE047] border border-black" />
            <span className="w-3 h-3 rounded-full bg-[#6EE7B7] border border-black" />
            <h3 className="font-display font-black text-lg text-black ml-2 uppercase">
              YOUTUBE MUSIC &amp; SPOTIFY PLAYER
            </h3>
          </div>
          <button
            onClick={() => {
              playPop(400);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-[#FF6B6B] border-2 border-black flex items-center justify-center text-black font-bold shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Embedded Interactive Player Box */}
        <div className="rounded-2xl bg-[#FAF7F2] border-2 border-black p-4 mb-4 shadow-[3px_3px_0px_#000] relative">
          <div className="flex items-center gap-4 mb-3">
            <img
              src={song.artworkUrl}
              alt={song.titleEng}
              className="w-16 h-16 rounded-xl border-2 border-black object-cover shadow-[2px_2px_0px_#000]"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FDE047] border border-black text-black">
                  15s Melodic Stem
                </span>
                <span className="text-[10px] font-mono-retro font-bold text-zinc-500">
                  {song.pitchKey} • {song.bpm} BPM
                </span>
              </div>
              <h4 className="font-black text-black text-base truncate font-display mt-0.5">
                {song.titleEng} | {song.titleNative}
              </h4>
              <p className="text-xs font-bold text-zinc-600 truncate">
                {song.artist} ({song.movieOrAlbum})
              </p>
            </div>
          </div>

          {/* Progress Waveform Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-zinc-200 h-3 rounded-full border-[1.5px] border-black overflow-hidden relative">
              <div
                className="bg-gradient-to-r from-[#FF6B6B] via-[#FDE047] to-[#6EE7B7] h-full transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono-retro font-black text-zinc-500">
              <span>0:{Math.floor(currentTime).toString().padStart(2, '0')}</span>
              <span className="text-black uppercase">
                {isPlaying ? 'Melody Playing 🎶' : 'Paused'}
              </span>
              <span>0:{Math.floor(duration).toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Play/Pause & Scrub Controls */}
          <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-zinc-300">
            <button
              onClick={() => {
                synthPlayer.stop();
                setCurrentTime(0);
                setIsPlaying(false);
                playPop(420);
              }}
              className="p-2 rounded-lg bg-white border border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-zinc-100 cursor-pointer"
              title="Restart melody"
            >
              <RotateCcw className="w-4 h-4 text-black" />
            </button>
            <button
              onClick={togglePlay}
              className="px-6 py-2 rounded-xl bg-[#FF6B6B] text-black font-black border-2 border-black shadow-[2.5px_2.5px_0px_#000] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-black" />
                  <span>PAUSE PREVIEW</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>PLAY PREVIEW</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Streaming Services List */}
        <div>
          <span className="text-xs font-black uppercase text-zinc-700 block mb-2">
            Open in YouTube Music &amp; Spotify:
          </span>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {platforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playPop(540)}
                className={`flex items-center justify-between p-2.5 rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] hover:translate-x-[2px] transition-all text-xs sm:text-sm font-black ${platform.color} group`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{platform.icon}</span>
                  <span className="font-display tracking-tight">{platform.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono-retro font-bold px-2 py-0.5 rounded bg-black/20 text-white">
                    {platform.badge}
                  </span>
                  <ExternalLink className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-2.5 border-t border-zinc-200 text-center">
          <p className="text-[11px] font-bold text-zinc-500">
            Powered by live YouTube Music &amp; Spotify metadata search.
          </p>
        </div>
      </div>
    </div>
  );
};
