import React, { useState } from 'react';
import { RotateCcw, Sparkles, Mic, Music2, Heart } from 'lucide-react';
import { SONGS_DATABASE } from './data/songs';
import { ScreenState, ActiveFeature, Song } from './types';
import { Header } from './components/Header';
import { OnboardingCard } from './components/OnboardingCard';
import { RecordEngine } from './components/RecordEngine';
import { SongMatchedView } from './components/SongMatchedView';
import { ListenModal } from './components/ListenModal';
import { KaraokeRoom } from './components/KaraokeRoom';
import { ReelCreatorStudio } from './components/ReelCreatorStudio';
import { FeedbackModal } from './components/FeedbackModal';
import { MusicDoodles } from './components/MusicDoodles';
import { playPop, synthPlayer } from './utils/audio';

export default function App() {
  const [screenState, setScreenState] = useState<ScreenState>('onboarding');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [activeSong, setActiveSong] = useState<Song>(SONGS_DATABASE[0]);
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>('none');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Derived 3 matched songs
  const bestMatch = activeSong;
  const otherSongs = SONGS_DATABASE.filter((s) => s.id !== activeSong.id);
  const alternative1 = otherSongs[0] || SONGS_DATABASE[1];
  const alternative2 = otherSongs[1] || SONGS_DATABASE[2];

  // Handle Mic Permission Granted
  const handlePermissionGranted = (stream: MediaStream | null) => {
    setMediaStream(stream);
    setScreenState('recording');
  };

  // Handle Instant Simulation
  const handleSimulateInstead = () => {
    setScreenState('recording');
  };

  // Handle Song Matched After 4s Countdown (Supports live ACRCloud object or songId)
  const handleSongMatched = (matched: Song | string) => {
    if (typeof matched === 'string') {
      const found = SONGS_DATABASE.find((s) => s.id === matched);
      if (found) setActiveSong(found);
    } else if (matched && typeof matched === 'object') {
      setActiveSong(matched);
    }
    setScreenState('matched');
  };

  // Reset to Fresh Humming Search
  const handleReset = () => {
    playPop(480);
    synthPlayer.stop();
    setActiveFeature('none');
    setScreenState('recording');
  };

  const handleFullReset = () => {
    playPop(420);
    synthPlayer.stop();
    setActiveFeature('none');
    setScreenState('onboarding');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-zinc-900 flex flex-col relative font-sans selection:bg-[#FDE047] selection:text-black">
      {/* Background Neo-Brutalist Doodles & Stickers */}
      <MusicDoodles />

      {/* Header & Sticky Navigation */}
      <Header
        onOpenFeedback={() => setShowFeedbackModal(true)}
        onReset={handleFullReset}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center justify-center relative z-10">
        {/* Step Flow Switcher */}
        {screenState === 'onboarding' && (
          <div className="w-full animate-fade-in my-auto">
            <OnboardingCard
              onPermissionGranted={handlePermissionGranted}
              onSimulateInstead={handleSimulateInstead}
            />
          </div>
        )}

        {screenState === 'recording' && (
          <div className="w-full animate-fade-in my-auto">
            <RecordEngine
              mediaStream={mediaStream}
              onSongMatched={handleSongMatched}
              onBackToPermission={handleFullReset}
            />
          </div>
        )}

        {screenState === 'matched' && (
          <div className="w-full animate-fade-in">
            <SongMatchedView
              bestMatch={bestMatch}
              alternative1={alternative1}
              alternative2={alternative2}
              activeSong={activeSong}
              onSelectSong={(song) => setActiveSong(song)}
              onOpenListen={() => setActiveFeature('listen_modal')}
              onOpenKaraoke={() => setActiveFeature('karaoke')}
              onOpenReel={() => setActiveFeature('reel_studio')}
            />
          </div>
        )}
      </main>

      {/* Floating "Try Another Song" Reset Button (when on Matched Screen) */}
      {screenState === 'matched' && (
        <div className="fixed bottom-6 right-6 z-40 animate-bounce">
          <button
            id="try-another-song-btn"
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FDE047] hover:bg-[#fed626] text-black font-black text-sm sm:text-base border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>HUM ANOTHER SONG</span>
            <span className="text-lg">🎙️</span>
          </button>
        </div>
      )}

      {/* Modals & Overlays */}
      {activeFeature === 'listen_modal' && (
        <ListenModal
          song={activeSong}
          onClose={() => setActiveFeature('none')}
        />
      )}

      {activeFeature === 'karaoke' && (
        <KaraokeRoom
          song={activeSong}
          mediaStream={mediaStream}
          onClose={() => setActiveFeature('none')}
        />
      )}

      {activeFeature === 'reel_studio' && (
        <ReelCreatorStudio
          song={activeSong}
          onClose={() => setActiveFeature('none')}
        />
      )}

      {showFeedbackModal && (
        <FeedbackModal onClose={() => setShowFeedbackModal(false)} />
      )}

      {/* Footer */}
      <footer className="w-full border-t-2 border-black bg-white/60 py-4 px-6 text-center text-xs font-bold text-zinc-600 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-black text-black">
            <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
            <span>FineTune</span> — The music finder built for the way India hums.
          </div>
          <div className="flex items-center gap-3">
            <span>Powered by Desi Audio Frequency Intelligence</span>
            <span>•</span>
            <span className="text-black font-black">20+ Indian Languages</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
