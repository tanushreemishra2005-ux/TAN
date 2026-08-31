export type LanguageCode =
  | 'hindi'
  | 'hinglish'
  | 'punjabi'
  | 'telugu'
  | 'tamil'
  | 'malayalam'
  | 'bengali'
  | 'bhojpuri'
  | 'haryanvi'
  | 'kannada'
  | 'marathi'
  | 'gujarati';

export interface LyricLine {
  id: number;
  time: number; // in seconds
  duration: number; // in seconds
  textEng: string;
  textNative: string;
  pinyinOrPhonetic?: string;
}

export interface Song {
  id: string;
  titleEng: string;
  titleNative: string;
  movieOrAlbum: string;
  artist: string;
  originalLang: string;
  confidence: number; // 0 - 100
  badgeLabel?: string;
  artworkUrl: string;
  previewUrl?: string; // Real 30-second official audio preview from iTunes/Spotify/CDN
  audioTrackUrl?: string;
  gradientColors: string;
  cardColor: string; // e.g. '#C4B5FD', '#FDE047', '#6EE7B7'
  accentColor: string;
  youtubeMusicUrl: string;
  youtubeVideoId?: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  jiosaavnUrl: string;
  lyrics: LyricLine[];
  bpm: number;
  pitchKey: string;
  baseFreq: number; // base frequency in Hz for synth melody playback
  melodyNotes: { freq: number; dur: number; time: number }[];
  genre: string;
  year: number;
  isrc?: string;
  sourceType?: 'spotify' | 'youtube' | 'itunes' | 'verified_catalog' | 'gemini_ai';
  engine?: string;
}

export type ScreenState = 'onboarding' | 'recording' | 'matched';

export type ActiveFeature = 'none' | 'listen_modal' | 'karaoke' | 'reel_studio';

export type VideoFilter = 'normal' | 'sparkles' | 'retro_vhs' | 'bollywood_glitz' | 'neon_glow';

export interface FeedbackData {
  name: string;
  email: string;
  rating: number;
  recognizedLanguage: string;
  humAccuracy: string;
  comments: string;
}
