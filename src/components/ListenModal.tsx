import React, { useState, useEffect } from 'react';
import { X, Play, Pause, ExternalLink, Volume2, RotateCcw, Music, Youtube } from 'lucide-react';
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

  useEffect(() => {
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
      desc: 'Official Audio',
      icon: <Youtube className="w-4 h-4" />,
    },
    {
      name: 'Spotify',
      url: song.spotifyUrl,
      color: 'bg-[#1DB954] hover:bg-[#19a34a] text-black',
      desc: 'Stream Free',
      icon: <Music className="w-4 h-4" />,
    },
    {
      name: 'YouTube',
      url: song.youtubeVideoId
        ? `https://www.youtube.com/watch?v=${song.youtubeVideoId}`
        : `https://www.youtube.com/results?search_query=${encodeURIComponent(song.titleEng + ' ' + song.artist)}`,
      color: 'bg-zinc-900 hover:bg-black text-white',
      desc: 'Watch Video',
      icon: <Play className="w-4 h-4 fill-white" />,
    },
    {
      name: 'Apple Music',
      url: song.appleMusicUrl,
      color: 'bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-90 text-white',
      desc: 'Spatial Audio',
      icon: <span className="text-sm">🍎</span>,
    },
    {
      name: 'JioSaavn',
      url: song.jiosaavnUrl,
      color: 'bg-[#00D8F6] hover:bg-[#00c0db] text-black',
      desc: 'Regional',
      icon: <Music className="w-4 h-4" />,
    },
  ];

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl neo-box-lg p-5 sm:p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B6B] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Play className="w-4 h-4 fill-black text-black" />
            </div>
            <h3 className="font-display font-black text-base text-black uppercase">
              Listen & Stream
            </h3>
          </div>
          <button
            onClick={() => {
              playPop(400);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-[#FF6B6B] border-2 border-black flex items-center justify-center text-black font-bold shadow-[2px_2px_0px_#000] cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* YouTube Embed + Player */}
        <div className="rounded-2xl bg-zinc-950 border-2 border-black mb-4 overflow-hidden shadow-[3px_3px_0px_#000]">
          {/* YouTube Embed if video ID available */}
          {song.youtubeVideoId ? (
            <div className="relative w-full aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${song.youtubeVideoId}?autoplay=1&rel=0`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={`${song.titleEng} - YouTube Music`}
              />
            </div>
          ) : (
            /* Fallback: Synth Player */
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={song.artworkUrl}
                  alt={song.titleEng}
                  className="w-14 h-14 rounded-xl border-2 border-white/20 object-cover shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-white text-sm truncate">
                    {song.titleEng}
                  </h4>
                  <p className="text-[11px] font-semibold text-zinc-400 truncate">
                    {song.artist} • {song.movieOrAlbum}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#FF6B6B] via-[#FDE047] to-[#6EE7B7] h-full transition-all duration-100"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono-retro font-bold text-zinc-500">
                  <span>0:{Math.floor(currentTime).toString().padStart(2, '0')}</span>
                  <span>0:15</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mt-2">
                <button
                  onClick={() => {
                    synthPlayer.stop();
                    setCurrentTime(0);
                    setIsPlaying(false);
                    playPop(420);
                  }}
                  className="p-2 rounded-lg bg-zinc-800 border border-white/10 text-white cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={togglePlay}
                  className="px-5 py-2 rounded-xl bg-[#FF6B6B] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-black" />
                      PAUSE
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-black" />
                      PLAY
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Song Info Bar */}
        <div className="flex items-center gap-3 px-3 py-2 bg-[#FAF7F2] rounded-xl border-2 border-black/10 mb-3">
          <img
            src={song.artworkUrl}
            alt={song.titleEng}
            className="w-10 h-10 rounded-lg border border-black/10 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-sm text-black truncate">{song.titleEng}</h4>
            <p className="text-[10px] font-semibold text-zinc-500 truncate">{song.artist}</p>
          </div>
          <span className="text-[9px] font-mono-retro font-bold text-zinc-400 shrink-0">
            {song.pitchKey} • {song.bpm}BPM
          </span>
        </div>

        {/* Streaming Platforms */}
        <div className="flex-1 overflow-y-auto">
          <span className="text-[11px] font-black uppercase text-zinc-500 block mb-2">
            Open in Streaming Platform
          </span>
          <div className="space-y-2">
            {platforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playPop(540)}
                className={`flex items-center justify-between p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:shadow-[3px_3px_0px_#000] transition-all text-xs font-black ${platform.color} group`}
              >
                <div className="flex items-center gap-2.5">
                  {platform.icon}
                  <span className="font-display">{platform.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase font-mono-retro font-bold px-1.5 py-0.5 rounded bg-black/15">
                    {platform.desc}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-zinc-200 text-center">
          <p className="text-[10px] font-bold text-zinc-400">
            Powered by YouTube Music, Spotify &amp; Apple Music
          </p>
        </div>
      </div>
    </div>
  );
};
