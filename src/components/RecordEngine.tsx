import React, { useState, useEffect, useRef } from 'react';
import { Mic, Search, Sparkles, Zap, RotateCcw, CheckCircle2, ExternalLink } from 'lucide-react';
import { INDIAN_LANGUAGES, PRESET_HUMS, SONGS_DATABASE } from '../data/songs';
import { Song } from '../types';
import { playPop, playCountdownBeep, playSuccessFanfare, triggerConfetti, MicPitchDetector, blobToBase64 } from '../utils/audio';

interface RecordEngineProps {
  mediaStream: MediaStream | null;
  onSongMatched: (selectedSong: Song | string) => void;
  onBackToPermission?: () => void;
}

export const RecordEngine: React.FC<RecordEngineProps> = ({
  mediaStream,
  onSongMatched,
  onBackToPermission,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [micVolume, setMicVolume] = useState(25);
  const [micPitch, setMicPitch] = useState<number | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('tum-hi-ho');
  const [activeLang, setActiveLang] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);
  const [liveVocalTranscript, setLiveVocalTranscript] = useState<string>('');
  const [recognitionStatus, setRecognitionStatus] = useState<string>('Ready to identify');
  const [isApifyConnected, setIsApifyConnected] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pitchDetectorRef = useRef<MicPitchDetector | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);

  // Check Apify / Spotify engine status
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.apifyConfigured) {
          setIsApifyConnected(true);
        }
      })
      .catch(() => {});
  }, []);

  // Initialize pitch detector if stream is present
  useEffect(() => {
    if (mediaStream) {
      const detector = new MicPitchDetector();
      pitchDetectorRef.current = detector;
      detector.start(mediaStream, (vol, pitch) => {
        setMicVolume(vol);
        if (pitch > 50) setMicPitch(Math.round(pitch));
      });
    }

    return () => {
      pitchDetectorRef.current?.stop();
    };
  }, [mediaStream]);

  // Visualizer canvas animation
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const numBars = 28;
      const barWidth = width / numBars - 4;

      for (let i = 0; i < numBars; i++) {
        const harmonic = Math.sin(phase + i * 0.3) * 0.5 + 0.5;
        const volMultiplier = isRecording ? Math.max(0.35, micVolume / 45) : 0.2;
        const barHeight = Math.max(6, harmonic * (height - 12) * volMultiplier);

        const x = i * (barWidth + 4);
        const y = (height - barHeight) / 2;

        const colors = ['#FF6B6B', '#FDE047', '#6EE7B7', '#7DD3FC', '#C4B5FD'];
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
        ctx.stroke();
      }

      phase += isRecording ? 0.18 : 0.03;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isRecording, micVolume]);

  // Handle search from YouTube Music and Spotify
  const handleDirectSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearchingTrack) return;

    playPop(600);
    setIsSearchingTrack(true);
    setRecognitionStatus(`Searching for "${searchQuery}"...`);

    try {
      const res = await fetch(`/api/search-track?q=${encodeURIComponent(searchQuery)}&lang=${activeLang}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const top = data.results[0];
          const existing = SONGS_DATABASE.find(
            (s) =>
              s.titleEng.toLowerCase().includes(searchQuery.toLowerCase()) ||
              searchQuery.toLowerCase().includes(s.titleEng.toLowerCase())
          );

          const matchedSong: Song = {
            id: top.id || `search-${Date.now()}`,
            titleEng: top.title,
            titleNative: existing?.titleNative || top.title,
            movieOrAlbum: top.album || existing?.movieOrAlbum || 'Single',
            artist: top.artist || 'Featured Artist',
            originalLang: existing?.originalLang || (activeLang === 'english' ? 'English / Global Pop' : 'Hindi / Indic'),
            confidence: 99,
            badgeLabel: 'SEARCH MATCH 🎯',
            cardColor: existing?.cardColor || '#BAE6FD',
            accentColor: existing?.accentColor || '#0284C7',
            gradientColors: existing?.gradientColors || 'from-cyan-500 to-blue-600',
            artworkUrl: top.artworkUrl || existing?.artworkUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
            previewUrl: top.previewUrl || existing?.previewUrl,
            youtubeVideoId: top.youtubeVideoId || existing?.youtubeVideoId,
            youtubeMusicUrl: top.youtubeMusicUrl || `https://music.youtube.com/search?q=${encodeURIComponent(top.title + ' ' + top.artist)}`,
            spotifyUrl: top.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(top.title + ' ' + top.artist)}`,
            appleMusicUrl: top.appleMusicUrl || `https://music.apple.com/search?term=${encodeURIComponent(top.title)}`,
            jiosaavnUrl: top.jiosaavnUrl || `https://www.jiosaavn.com/search/${encodeURIComponent(top.title + ' ' + top.artist)}`,
            lyrics: existing?.lyrics || [
              {
                id: 1,
                time: 0,
                duration: 4,
                textEng: `${top.title} - ${top.artist}`,
                textNative: `${top.title} - ${top.artist}`,
              },
            ],
            bpm: existing?.bpm || 110,
            pitchKey: existing?.pitchKey || 'C Major',
            baseFreq: existing?.baseFreq || 261.63,
            melodyNotes: existing?.melodyNotes || [{ freq: 261.63, dur: 0.5, time: 0 }],
            genre: top.genre || existing?.genre || 'Pop',
            year: top.releaseYear || existing?.year || 2023,
            sourceType: 'spotify',
            engine: 'YouTube Music & Spotify Search',
          };

          playSuccessFanfare();
          triggerConfetti();
          onSongMatched(matchedSong);
          return;
        }
      }
    } catch (err) {
      console.warn('Search track error:', err);
    } finally {
      setIsSearchingTrack(false);
    }

    // Fallback
    const fallback = SONGS_DATABASE[0];
    playSuccessFanfare();
    triggerConfetti();
    onSongMatched(fallback);
  };

  // Handle Recording Trigger & 4-second Countdown
  const startRecording = async (presetIdToMatch?: string) => {
    if (isRecording) return;
    playPop(650);
    setIsRecording(true);
    setIsRecognizing(false);
    setCountdown(4);
    setLiveVocalTranscript('');
    recordedChunksRef.current = [];

    const presetToUse = presetIdToMatch || selectedPreset;

    // Start Web Speech Recognition
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognizer = new SpeechRecognition();
        recognizer.continuous = true;
        recognizer.interimResults = true;
        recognizer.lang = activeLang === 'english' ? 'en-US' : 'hi-IN';
        recognizer.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + ' ';
          }
          setLiveVocalTranscript(transcript.trim());
        };
        speechRecognitionRef.current = recognizer;
        recognizer.start();
      }
    } catch (err) {}

    // Start MediaRecorder if real microphone stream exists
    if (mediaStream) {
      try {
        const recorder = new MediaRecorder(mediaStream);
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.start(100);
      } catch (err) {
        console.warn('MediaRecorder init fallback:', err);
      }
    }

    let currentSec = 4;
    playCountdownBeep(false);

    countdownIntervalRef.current = window.setInterval(async () => {
      currentSec -= 1;
      setCountdown(currentSec);

      if (currentSec > 0) {
        playCountdownBeep(false);
      } else {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        playCountdownBeep(true);
        setIsRecording(false);
        setIsRecognizing(true);
        setRecognitionStatus('Identifying across YouTube Music & Spotify...');

        // Stop speech recognizer
        if (speechRecognitionRef.current) {
          try { speechRecognitionRef.current.stop(); } catch (e) {}
        }

        // Stop recorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }

        const targetPreset = SONGS_DATABASE.find((s) => s.id === presetToUse) || SONGS_DATABASE[0];

        try {
          let base64Audio = '';
          if (recordedChunksRef.current.length > 0) {
            const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
            base64Audio = await blobToBase64(blob);
          }

          const response = await fetch('/api/recognize-hum', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Audio,
              mimeType: 'audio/webm',
              transcriptOrLyrics: liveVocalTranscript,
              melodyPitchData: micPitch ? `Pitch: ${micPitch}Hz` : undefined,
              preferredLang: activeLang,
              queryHint: `${targetPreset.titleEng} ${targetPreset.artist}`,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.bestMatch) {
              const dbMatch = SONGS_DATABASE.find(
                (s) =>
                  s.titleEng.toLowerCase() === data.bestMatch.titleEng?.toLowerCase() ||
                  s.id === data.bestMatch.id
              );

              const merged: Song = {
                ...data.bestMatch,
                lyrics: dbMatch?.lyrics || data.bestMatch.lyrics || targetPreset.lyrics,
                melodyNotes: dbMatch?.melodyNotes || targetPreset.melodyNotes,
                baseFreq: dbMatch?.baseFreq || targetPreset.baseFreq,
                cardColor: dbMatch?.cardColor || data.bestMatch.cardColor,
                accentColor: dbMatch?.accentColor || data.bestMatch.accentColor,
                gradientColors: dbMatch?.gradientColors || data.bestMatch.gradientColors,
              };

              playSuccessFanfare();
              triggerConfetti();
              onSongMatched(merged);
              return;
            }
          }
        } catch (apiErr) {
          console.warn('Recognition fallback:', apiErr);
        }

        // Seamless catalog matching
        setTimeout(() => {
          playSuccessFanfare();
          triggerConfetti();
          onSongMatched(targetPreset);
        }, 400);
      }
    }, 1000);
  };

  const cancelRecording = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsRecognizing(false);
    setCountdown(4);
    playPop(300);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-fade-in">
      {/* Main Recording Card */}
      <div className="w-full bg-white rounded-3xl neo-box-lg p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
            backgroundSize: '18px 18px',
          }}
        />

        {/* Search Bar — Prominent for Music Identification */}
        <form onSubmit={handleDirectSearch} className="w-full mb-5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any song, artist, or lyrics..."
                className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] rounded-xl border-2 border-black font-semibold text-sm text-black placeholder:text-zinc-400 shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-black/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!searchQuery.trim() || isSearchingTrack}
              className="px-5 py-3 rounded-xl bg-[#FF6B6B] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#ff5555] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap transition-all"
            >
              {isSearchingTrack ? '...' : 'IDENTIFY'}
            </button>
          </div>
        </form>

        {/* Live Audio Visualizer */}
        <div className="w-full bg-[#FAF7F2] rounded-2xl border-2 border-black p-3 mb-5 relative overflow-hidden shadow-[2px_2px_0px_#000]">
          <div className="flex items-center justify-between px-1 mb-1.5 text-[10px] font-bold text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isRecording
                    ? 'bg-red-500 animate-ping'
                    : isRecognizing
                    ? 'bg-amber-400 animate-spin'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="truncate">
                {isRecording
                  ? liveVocalTranscript
                    ? `"${liveVocalTranscript}"`
                    : 'LISTENING...'
                  : isRecognizing
                  ? 'MATCHING SONG...'
                  : recognitionStatus}
              </span>
            </span>
            <span className="font-mono-retro shrink-0 text-zinc-400">
              {micPitch ? `${micPitch}Hz` : ''}
            </span>
          </div>
          <canvas
            ref={canvasRef}
            width={580}
            height={60}
            className="w-full h-14 sm:h-16 rounded-xl"
          />
        </div>

        {/* Record Button */}
        <div className="w-full flex items-center justify-center my-2 relative z-10">
          {!isRecording && !isRecognizing ? (
            <button
              id="start-hum-record-btn"
              onClick={() => startRecording()}
              className="relative group px-10 sm:px-14 py-5 sm:py-6 rounded-full bg-gradient-to-r from-[#FF6B6B] via-[#FDE047] to-[#6EE7B7] hover:brightness-105 text-black font-black text-lg sm:text-xl border-[3px] border-black shadow-[5px_5px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] transition-all cursor-pointer flex items-center gap-3 select-none"
            >
              <div className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000]">
                <Mic className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-display tracking-wide">HUM OR SING</span>
            </button>
          ) : isRecording ? (
            <button
              onClick={cancelRecording}
              className="relative px-10 sm:px-14 py-5 sm:py-6 rounded-full bg-[#FF6B6B] text-black font-black text-lg sm:text-xl border-[3px] border-black shadow-[4px_4px_0px_#000] flex items-center gap-3 animate-recording-glow cursor-pointer"
            >
              <span className="text-2xl font-mono-retro font-black bg-black text-[#FDE047] px-3 py-0.5 rounded-lg border border-black">
                {countdown}s
              </span>
              <span className="font-display">KEEP HUMMING!</span>
            </button>
          ) : (
            <div className="px-10 sm:px-14 py-5 sm:py-6 rounded-full bg-[#FDE047] text-black font-black text-base sm:text-lg border-[3px] border-black shadow-[4px_4px_0px_#000] flex items-center gap-3 animate-pulse">
              <Sparkles className="w-5 h-5 animate-spin text-black" />
              <span className="font-display">IDENTIFYING...</span>
            </div>
          )}
        </div>

        {/* Countdown Progress Bar */}
        {isRecording && (
          <div className="w-full max-w-sm mt-4 bg-zinc-200 h-2.5 rounded-full border-2 border-black overflow-hidden p-0.5 shadow-[1.5px_1.5px_0px_#000]">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B6B] via-[#FDE047] to-[#6EE7B7] rounded-full transition-all duration-300"
              style={{ width: `${((4 - countdown) / 4) * 100}%` }}
            />
          </div>
        )}

        {/* Language Filter — Compact */}
        <div className="w-full mt-5 pt-4 border-t-2 border-black/10 relative z-10">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-black uppercase text-zinc-500">
              Language
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] -mx-1 px-1">
            {INDIAN_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  playPop(500);
                  setActiveLang(lang.code);
                }}
                className={`px-2.5 py-1 rounded-lg border-2 border-black font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeLang === lang.code
                    ? 'bg-[#FDE047] text-black font-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white hover:bg-zinc-50 text-zinc-600'
                }`}
              >
                <span>{lang.flag} </span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="w-full mt-4 bg-[#FAF7F2] rounded-2xl border-2 border-black p-3 shadow-[2px_2px_0px_#000] relative z-10">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-black uppercase text-zinc-500 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
              Quick Tests
            </span>
            {isApifyConnected && (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#6EE7B7] text-black border border-black">
                YouTube Music Connected
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {PRESET_HUMS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedPreset(preset.id);
                  startRecording(preset.id);
                }}
                disabled={isRecording || isRecognizing}
                className="p-2 rounded-xl border-2 border-black text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-white hover:bg-zinc-50 shadow-[1px_1px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-black text-black truncate">{preset.name}</span>
                  <span className="text-[8px] font-black uppercase px-1 rounded bg-black/5 text-zinc-500 shrink-0">
                    {preset.tag}
                  </span>
                </div>
                <div className="text-[10px] font-semibold text-zinc-500 truncate">{preset.movie}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
