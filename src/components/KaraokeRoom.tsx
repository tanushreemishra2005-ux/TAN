import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, Mic, Flame, Sparkles, Music, Sliders, Award, Headphones, Disc } from 'lucide-react';
import { Song } from '../types';
import { playPop, synthPlayer, MicPitchDetector, triggerConfetti } from '../utils/audio';

interface KaraokeRoomProps {
  song: Song;
  mediaStream: MediaStream | null;
  onClose: () => void;
}

export const KaraokeRoom: React.FC<KaraokeRoomProps> = ({
  song,
  mediaStream,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioMode, setAudioMode] = useState<'instrumental' | 'guide'>('instrumental');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const [pitchShift, setPitchShift] = useState(0); // Semitones (-2 to +2)
  const [micVolume, setMicVolume] = useState(0);
  const [pitchAccuracy, setPitchAccuracy] = useState(94);
  const [scriptView, setScriptView] = useState<'both' | 'devanagari' | 'english'>('both');

  const pitchDetectorRef = useRef<MicPitchDetector | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // Active lyric calculation
  const activeLyricIndex = song.lyrics.findIndex((lyric, idx) => {
    const nextLyric = song.lyrics[idx + 1];
    if (nextLyric) {
      return currentTime >= lyric.time && currentTime < nextLyric.time;
    }
    return currentTime >= lyric.time;
  });

  // Start Mic Pitch Detector if stream available
  useEffect(() => {
    if (mediaStream) {
      const detector = new MicPitchDetector();
      pitchDetectorRef.current = detector;
      detector.start(mediaStream, (vol, pitch, acc) => {
        setMicVolume(vol);
        if (acc > 0) {
          setPitchAccuracy(acc);
        }
      });
    }

    return () => {
      pitchDetectorRef.current?.stop();
    };
  }, [mediaStream]);

  // Autoplay karaoke instrumental
  useEffect(() => {
    startKaraokeAudio(audioMode, pitchShift);

    return () => {
      synthPlayer.stop();
    };
  }, [song]);

  const startKaraokeAudio = (mode: 'instrumental' | 'guide', shift: number) => {
    setIsPlaying(true);
    synthPlayer.playSong(
      song,
      mode,
      shift,
      (time, dur) => {
        setCurrentTime(time);
        setDuration(dur);
      },
      () => {
        setIsPlaying(false);
        triggerConfetti();
      }
    );
  };

  const handleModeToggle = (mode: 'instrumental' | 'guide') => {
    playPop(550);
    setAudioMode(mode);
    if (isPlaying) {
      startKaraokeAudio(mode, pitchShift);
    }
  };

  const handlePitchChange = (newShift: number) => {
    playPop(520 + newShift * 40);
    setPitchShift(newShift);
    if (isPlaying) {
      startKaraokeAudio(audioMode, newShift);
    }
  };

  const togglePlay = () => {
    playPop(500);
    if (isPlaying) {
      synthPlayer.stop();
      setIsPlaying(false);
    } else {
      startKaraokeAudio(audioMode, pitchShift);
    }
  };

  const restartTrack = () => {
    playPop(450);
    synthPlayer.stop();
    setCurrentTime(0);
    startKaraokeAudio(audioMode, pitchShift);
  };

  const getRatingBadge = (score: number) => {
    if (score >= 90) return { label: 'Surila Superstar! 🌟', bg: 'bg-[#FDE047] text-black' };
    if (score >= 80) return { label: 'Bollywood Ready! 🔥', bg: 'bg-[#FF6B6B] text-white' };
    return { label: 'Melody in Rhythm! 🎶', bg: 'bg-[#6EE7B7] text-black' };
  };

  const rating = getRatingBadge(pitchAccuracy);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#FAF7F2] rounded-3xl neo-box-lg p-5 sm:p-7 relative flex flex-col my-auto max-h-[94vh] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <img
              src={song.artworkUrl}
              alt={song.titleEng}
              className="w-12 h-12 rounded-xl border-2 border-black object-cover shadow-[2px_2px_0px_#000]"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FF6B6B] text-white border border-black">
                  15S KARAOKE ROOM
                </span>
                <span className="text-xs font-mono-retro font-bold text-zinc-600">
                  {song.pitchKey} • {song.movieOrAlbum}
                </span>
              </div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-black">
                {song.titleEng} ({song.titleNative})
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              playPop(400);
              synthPlayer.stop();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FF6B6B] border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Track Mode Switcher (Vocals + Beat vs. Instrumental Only) */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000] mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black uppercase text-zinc-700">Audio Mode:</span>
            <div className="flex items-center gap-1 bg-[#FAF7F2] p-0.5 rounded-xl border border-black">
              <button
                onClick={() => handleModeToggle('instrumental')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  audioMode === 'instrumental'
                    ? 'bg-[#FF6B6B] text-black shadow-[1.5px_1.5px_0px_#000]'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Instrumental Only (Karaoke)</span>
              </button>

              <button
                onClick={() => handleModeToggle('guide')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  audioMode === 'guide'
                    ? 'bg-[#FDE047] text-black shadow-[1.5px_1.5px_0px_#000]'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Vocals + Beat (Guide Track)</span>
              </button>
            </div>
          </div>

          {/* Script view toggle */}
          <div className="flex items-center gap-1 bg-[#FAF7F2] p-0.5 rounded-xl border border-black">
            {(['both', 'devanagari', 'english'] as const).map((view) => (
              <button
                key={view}
                onClick={() => {
                  playPop(520);
                  setScriptView(view);
                }}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-black uppercase transition-all cursor-pointer ${
                  scriptView === view
                    ? 'bg-black text-white'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Live Score & Pitch Accuracy Banner */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#FAF7F2] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-black text-[#FDE047] px-2.5 py-1 rounded-lg border border-black font-mono-retro font-black text-xs">
              <Flame className="w-3.5 h-3.5 text-[#FF6B6B] fill-[#FF6B6B] animate-bounce" />
              <span>Pitch Accuracy: {pitchAccuracy}%</span>
            </div>
            <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_#000] ${rating.bg}`}>
              {rating.label}
            </span>
          </div>

          <div className="text-[11px] font-bold text-zinc-600 flex items-center gap-1">
            <Disc className="w-3.5 h-3.5 text-black animate-spin" style={{ animationDuration: '4s' }} />
            <span>15s Hook Loop</span>
          </div>
        </div>

        {/* Synchronized Lyric Teleprompter Window */}
        <div
          ref={lyricsContainerRef}
          className="flex-1 bg-zinc-950 rounded-2xl border-[3px] border-black p-5 sm:p-6 overflow-y-auto min-h-[200px] max-h-[260px] flex flex-col items-center justify-center text-center relative shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]"
        >
          <div className="space-y-5 w-full py-2">
            {song.lyrics.map((line, idx) => {
              const isActive = idx === activeLyricIndex;
              const isPast = idx < activeLyricIndex;

              return (
                <div
                  key={line.id}
                  className={`transition-all duration-300 transform ${
                    isActive
                      ? 'scale-110 opacity-100 font-black'
                      : isPast
                      ? 'opacity-35 scale-95'
                      : 'opacity-40 scale-95'
                  }`}
                >
                  {(scriptView === 'both' || scriptView === 'devanagari') && (
                    <p
                      className={`text-xl sm:text-2xl tracking-wide transition-colors ${
                        isActive
                          ? 'text-[#FDE047] drop-shadow-[0_0_12px_rgba(253,224,71,0.7)] font-bold'
                          : 'text-white'
                      }`}
                    >
                      {line.textNative}
                    </p>
                  )}

                  {(scriptView === 'both' || scriptView === 'english') && (
                    <p
                      className={`text-sm sm:text-base italic mt-0.5 tracking-tight ${
                        isActive
                          ? 'text-[#6EE7B7] drop-shadow-[0_0_8px_rgba(110,231,183,0.6)] font-extrabold not-italic'
                          : 'text-zinc-400'
                      }`}
                    >
                      {line.textEng}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Audio Progress Scrubber */}
        <div className="mt-3 px-1">
          <div className="w-full bg-zinc-200 h-2.5 rounded-full border-2 border-black overflow-hidden relative">
            <div
              className="bg-gradient-to-r from-[#FF6B6B] via-[#FDE047] to-[#6EE7B7] h-full transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono-retro font-black text-zinc-600 mt-1">
            <span>0:{Math.floor(currentTime).toString().padStart(2, '0')}</span>
            <span className="text-black uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              {audioMode === 'instrumental' ? 'Sing into your mic now!' : 'Listen to master vocals'}
            </span>
            <span>0:15</span>
          </div>
        </div>

        {/* Karaoke Control Deck */}
        <div className="mt-3 pt-3 border-t-2 border-black flex flex-wrap items-center justify-between gap-3">
          {/* Pitch Adjuster Controls */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="text-xs font-black text-zinc-700 uppercase flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              Pitch / Key:
            </span>
            <div className="flex items-center gap-1">
              {[-2, -1, 0, 1, 2].map((shift) => (
                <button
                  key={shift}
                  onClick={() => handlePitchChange(shift)}
                  className={`w-7 h-7 rounded-lg text-xs font-black border border-black cursor-pointer ${
                    pitchShift === shift
                      ? 'bg-[#FF6B6B] text-black shadow-[1px_1px_0px_#000]'
                      : 'bg-[#FAF7F2] text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {shift > 0 ? `+${shift}` : shift === 0 ? '0' : shift}
                </button>
              ))}
            </div>
          </div>

          {/* Play/Pause & Replay Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={restartTrack}
              className="p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-zinc-100 cursor-pointer"
              title="Restart 15s Hook"
            >
              <RotateCcw className="w-5 h-5 text-black" />
            </button>

            <button
              onClick={togglePlay}
              className="px-6 py-2.5 rounded-xl bg-[#FDE047] hover:bg-[#fed72a] text-black font-black border-[2.5px] border-black shadow-[3px_3px_0px_#000] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-black" />
                  <span>PAUSE TRACK</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-black" />
                  <span>PLAY KARAOKE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
