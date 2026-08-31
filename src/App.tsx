import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
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

  // Derived matches
  const bestMatch = activeSong;
  const otherSongs = SONGS_DATABASE.filter((s) => s.id !== activeSong.id);
  const alternative1 = otherSongs[0] || SONGS_DATABASE[1];
  const alternative2 = otherSongs[1] || SONGS_DATABASE[2];

  const handlePermissionGranted = (stream: MediaStream | null) => {
    setMediaStream(stream);
    setScreenState('recording');
  };

  const handleSimulateInstead = () => {
    setScreenState('recording');
  };

  const handleSongMatched = (matched: Song | string) => {
    if (typeof matched === 'string') {
      const found = SONGS_DATABASE.find((s) => s.id === matched);
      if (found) setActiveSong(found);
    } else if (matched && typeof matched === 'object') {
      setActiveSong(matched);
    }
    setScreenState('matched');
  };

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
      {/* Background Doodles */}
      <MusicDoodles />

      {/* Header */}
      <Header
        onOpenFeedback={() => setShowFeedbackModal(true)}
        onReset={handleFullReset}
      />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center justify-center relative z-10">
        {screenState === 'onboarding' && (
          <div className="w-full my-auto">
            <OnboardingCard
              onPermissionGranted={handlePermissionGranted}
              onSimulateInstead={handleSimulateInstead}
            />
          </div>
        )}

        {screenState === 'recording' && (
          <div className="w-full my-auto">
            <RecordEngine
              mediaStream={mediaStream}
              onSongMatched={handleSongMatched}
              onBackToPermission={handleFullReset}
            />
          </div>
        )}

        {screenState === 'matched' && (
          <div className="w-full">
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

      {/* Floating Reset Button */}
      {screenState === 'matched' && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            id="try-another-song-btn"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FDE047] hover:bg-[#fed626] text-black font-black text-xs sm:text-sm border-[2.5px] border-black shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>HUM AGAIN</span>
          </button>
        </div>
      )}

      {/* Modals */}
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
      <footer className="w-full border-t-2 border-black/10 bg-white/60 py-3 px-6 text-center text-[11px] font-semibold text-zinc-500 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 font-black text-black">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
            <span>FineTune</span>
            <span className="font-normal text-zinc-400">— Hum to discover any song</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <span>YouTube Music &amp; Spotify</span>
            <span className="text-zinc-300">•</span>
            <span className="font-bold text-black">20+ Languages</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
