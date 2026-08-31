import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Video, Sparkles, Film, Download, RefreshCw, Volume2, Music, Check, Share2, Image as ImageIcon, SwitchCamera } from 'lucide-react';
import { Song, VideoFilter } from '../types';
import { playPop, playCountdownBeep, synthPlayer, triggerConfetti } from '../utils/audio';

interface ReelCreatorStudioProps {
  song: Song;
  onClose: () => void;
}

export const ReelCreatorStudio: React.FC<ReelCreatorStudioProps> = ({ song, onClose }) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [activeFilter, setActiveFilter] = useState<VideoFilter>('sparkles');
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0); // 0 to 100%
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isAudioAttached, setIsAudioAttached] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Request Camera & Audio Permission with specified facing mode
  const requestCameraAccess = async (targetFacing: 'user' | 'environment' = facingMode) => {
    playPop(550);
    setCameraError(null);

    // Stop existing stream if switching cameras
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: targetFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: true,
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setHasCameraPermission(true);
      } else {
        throw new Error('Camera API not available');
      }
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      // Try fallback to any available video device
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        mediaStreamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(() => {});
        }
        setHasCameraPermission(true);
      } catch (fallbackErr) {
        setCameraError('Camera unavailable or permission denied. Using FineTune Studio Virtual Lens!');
        setHasCameraPermission(false);
      }
    }
  };

  const toggleCameraFacing = () => {
    playPop(620);
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    requestCameraAccess(newFacing);
  };

  useEffect(() => {
    requestCameraAccess('user');

    return () => {
      synthPlayer.stop();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const filters = [
    { id: 'sparkles', label: 'Sparkles ✨', icon: '✨', bg: 'bg-[#FDE047]' },
    { id: 'retro_vhs', label: 'Retro VHS 📼', icon: '📼', bg: 'bg-[#FF6B6B]' },
    { id: 'bollywood_glitz', label: 'Bollywood Glitz 🌟', icon: '🌟', bg: 'bg-[#C4B5FD]' },
    { id: 'neon_glow', label: 'Neon Pop ⚡', icon: '⚡', bg: 'bg-[#6EE7B7]' },
    { id: 'normal', label: 'Clean 📽️', icon: '📽️', bg: 'bg-white' },
  ];

  // Start 15s Reel Recording
  const startRecordingReel = () => {
    if (isRecording) return;
    playPop(600);
    setIsRecording(true);
    setRecordProgress(0);
    setRecordedVideoUrl(null);
    setCapturedPhotoUrl(null);
    recordedChunksRef.current = [];

    // Start background audio snippet
    if (isAudioAttached) {
      synthPlayer.playSong(song, 'guide', 0);
    }

    const duration = 15;
    const intervalTime = 100;
    let elapsed = 0;

    if (mediaStreamRef.current) {
      try {
        const recorder = new MediaRecorder(mediaStreamRef.current);
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
          triggerConfetti();
        };
        recorder.start(100);
      } catch (e) {
        console.warn('MediaRecorder fallback:', e);
      }
    }

    timerRef.current = window.setInterval(() => {
      elapsed += intervalTime / 1000;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setRecordProgress(progress);

      if (elapsed >= duration) {
        stopRecordingReel();
      }
    }, intervalTime);
  };

  const stopRecordingReel = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    synthPlayer.stop();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      capturePhotoSnapshot();
      triggerConfetti();
    }
  };

  // Capture instant photo snapshot
  const capturePhotoSnapshot = () => {
    playPop(700);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 480;
    canvas.height = 640;

    if (video && hasCameraPermission) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 480, 640);
      grad.addColorStop(0, '#FF6B6B');
      grad.addColorStop(0.5, '#FDE047');
      grad.addColorStop(1, '#6EE7B7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 480, 640);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎵 FineTune Reel Studio', 240, 200);
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`${song.titleEng} • ${song.titleNative}`, 240, 240);
      ctx.font = 'italic 18px sans-serif';
      ctx.fillText(`Artist: ${song.artist}`, 240, 280);
      ctx.fillText('✨ 15s Indian Music Snippet', 240, 320);
    }

    // Add filter overlays to canvas
    if (activeFilter === 'sparkles' || activeFilter === 'bollywood_glitz') {
      ctx.fillStyle = 'rgba(253, 224, 71, 0.3)';
      ctx.font = '32px sans-serif';
      ctx.fillText('✨', 80, 100);
      ctx.fillText('✨', 380, 140);
      ctx.fillText('🌟', 120, 500);
      ctx.fillText('✨', 350, 520);
    }

    // Watermark
    ctx.fillStyle = '#000000';
    ctx.fillRect(20, 570, 440, 50);
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`FINETUNE • ${song.titleEng.toUpperCase()} REEL`, 240, 600);

    const dataUrl = canvas.toDataURL('image/png');
    setCapturedPhotoUrl(dataUrl);
  };

  const getFilterClass = () => {
    switch (activeFilter) {
      case 'retro_vhs':
        return 'filter-retro-vhs';
      case 'bollywood_glitz':
        return 'filter-bollywood-glitz';
      case 'neon_glow':
        return 'filter-neon-glow';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl neo-box-lg p-5 sm:p-6 relative flex flex-col my-auto max-h-[95vh] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#6EE7B7] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Film className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FF6B6B] text-white border border-black">
                15S REEL STUDIO
              </span>
              <h3 className="font-display font-black text-lg sm:text-xl text-black">
                Create Reel with "{song.titleEng}"
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Flip Camera Button (Front / Back camera) */}
            <button
              onClick={toggleCameraFacing}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#FDE047] border-2 border-black flex items-center gap-1 text-black font-black text-xs shadow-[2px_2px_0px_#000] cursor-pointer"
              title="Flip Camera (Front/Back)"
            >
              <SwitchCamera className="w-4 h-4" />
              <span className="hidden sm:inline">{facingMode === 'user' ? 'Front Cam' : 'Back Cam'}</span>
            </button>

            <button
              onClick={() => {
                playPop(400);
                synthPlayer.stop();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-[#FF6B6B] border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Attached Audio Snippet Badge */}
        <div className="flex items-center justify-between gap-2 p-2.5 bg-[#FDE047] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] mb-3">
          <div className="flex items-center gap-2 text-xs font-black text-black truncate">
            <Music className="w-4 h-4 shrink-0" />
            <span className="truncate">Attached Audio: 15s Hook of {song.titleEng}</span>
          </div>
          <button
            onClick={() => {
              playPop(480);
              setIsAudioAttached(!isAudioAttached);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black border border-black cursor-pointer ${
              isAudioAttached ? 'bg-black text-[#FDE047]' : 'bg-white text-zinc-600'
            }`}
          >
            {isAudioAttached ? '✓ AUDIO SYNCED' : 'MUTED'}
          </button>
        </div>

        {/* Video / Camera Viewport & Overlays */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-zinc-950 rounded-2xl border-[3px] border-black overflow-hidden flex items-center justify-center shadow-[4px_4px_0px_#000]">
          {/* Live Video Feed */}
          {hasCameraPermission ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${getFilterClass()}`}
            />
          ) : (
            <div
              className={`w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-900 ${getFilterClass()}`}
            >
              <img
                src={song.artworkUrl}
                alt={song.titleEng}
                className="w-24 h-24 rounded-2xl border-2 border-white/80 shadow-2xl object-cover mb-3 animate-pulse"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-black text-[#FDE047] tracking-widest uppercase bg-black/60 px-3 py-1 rounded-full border border-[#FDE047]">
                FineTune Virtual Lens Studio
              </span>
              <h4 className="text-white text-lg font-black mt-1">
                {song.titleEng} | {song.titleNative}
              </h4>
              <p className="text-xs text-zinc-300 max-w-xs mt-1">
                Filter: <b>{filters.find((f) => f.id === activeFilter)?.label}</b>
              </p>
              {cameraError && (
                <button
                  onClick={() => requestCameraAccess(facingMode)}
                  className="mt-3 text-[11px] font-black px-3 py-1 rounded-lg bg-[#7DD3FC] text-black border border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <Camera className="w-3 h-3 inline mr-1" />
                  Grant Camera Access (Front/Back)
                </button>
              )}
            </div>
          )}

          {/* VHS Scanlines Overlay */}
          {activeFilter === 'retro_vhs' && (
            <div className="absolute inset-0 pointer-events-none vhs-scanlines opacity-75">
              <div className="absolute top-3 left-4 text-emerald-400 font-mono text-xs font-black drop-shadow">
                PLAY ▶ 00:15:00
              </div>
              <div className="absolute bottom-3 right-4 text-red-500 font-mono text-xs font-black animate-pulse">
                REC ● SP
              </div>
            </div>
          )}

          {/* Sparkles / Bollywood Glitz Overlay */}
          {(activeFilter === 'sparkles' || activeFilter === 'bollywood_glitz') && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-4 left-6 text-2xl animate-bounce">✨</div>
              <div className="absolute top-8 right-8 text-2xl animate-pulse">🌟</div>
              <div className="absolute bottom-12 left-10 text-2xl animate-ping">✨</div>
              <div className="absolute bottom-6 right-12 text-2xl animate-bounce">💫</div>
            </div>
          )}

          {/* Reel Music Watermark */}
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg border border-white/40 text-[11px] font-black flex items-center gap-1.5 shadow">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>{song.titleEng}</span>
          </div>

          {/* Recording Progress Ring Overlay */}
          {isRecording && (
            <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
              <div className="text-4xl font-black text-[#FDE047] font-mono-retro drop-shadow-[2px_2px_0px_#000] animate-bounce">
                {Math.round((15 * (100 - recordProgress)) / 100)}s
              </div>
              <p className="text-xs font-black text-white uppercase tracking-widest mt-1">
                RECORDING 15S REEL...
              </p>
            </div>
          )}
        </div>

        {/* Hidden Canvas for Snapshots */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Filter Selection Chips */}
        <div className="mt-3">
          <span className="text-[11px] font-black uppercase text-zinc-600 block mb-1.5">
            Select Video Filter:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  playPop(500);
                  setActiveFilter(f.id as VideoFilter);
                }}
                className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                  activeFilter === f.id
                    ? `${f.bg} shadow-[2.5px_2.5px_0px_#000] scale-105`
                    : 'bg-zinc-100 hover:bg-white'
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls: Record 15s Reel / Snap Photo */}
        <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between gap-3">
          <button
            onClick={capturePhotoSnapshot}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
          >
            <ImageIcon className="w-4 h-4" />
            <span>SNAP PHOTO</span>
          </button>

          {!isRecording ? (
            <button
              id="record-reel-action-btn"
              onClick={startRecordingReel}
              className="relative px-6 py-3 rounded-full bg-[#FF6B6B] hover:bg-[#ff5555] text-black font-black text-sm sm:text-base border-[2.5px] border-black shadow-[3px_3px_0px_#000] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 group"
            >
              <div className="w-4 h-4 rounded-full bg-black animate-ping" />
              <span>RECORD 15S REEL</span>
            </button>
          ) : (
            <button
              onClick={stopRecordingReel}
              className="px-6 py-3 rounded-full bg-[#FDE047] text-black font-black text-sm border-[2.5px] border-black shadow-[3px_3px_0px_#000] animate-pulse cursor-pointer flex items-center gap-2"
            >
              <span className="w-3 h-3 bg-black rounded-sm" />
              <span>STOP RECORDING ({Math.round(recordProgress)}%)</span>
            </button>
          )}

          {(recordedVideoUrl || capturedPhotoUrl) && (
            <a
              href={recordedVideoUrl || capturedPhotoUrl || '#'}
              download={`FineTune_${song.titleEng}_Reel.png`}
              onClick={() => playPop(600)}
              className="px-4 py-2.5 rounded-xl bg-[#6EE7B7] hover:bg-[#5cdba9] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>SAVE REEL</span>
            </a>
          )}
        </div>

        {capturedPhotoUrl && (
          <div className="mt-3 p-3 bg-[#6EE7B7] rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <img
                src={capturedPhotoUrl}
                alt="Captured Snapshot"
                className="w-10 h-10 rounded-lg border border-black object-cover"
              />
              <span className="text-xs font-black text-black">
                Reel Snapshot created with {song.titleEng}!
              </span>
            </div>
            <a
              href={capturedPhotoUrl}
              download={`FineTune_${song.titleEng}_Reel.png`}
              className="text-xs font-black px-3 py-1.5 rounded-lg bg-black text-[#FDE047] border border-black shadow-[1.5px_1.5px_0px_#000] cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
