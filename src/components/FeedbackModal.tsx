import React, { useState } from 'react';
import { X, Star, Sparkles, Send, CheckCircle2, Heart } from 'lucide-react';
import { INDIAN_LANGUAGES } from '../data/songs';
import { playPop, playChime, triggerConfetti } from '../utils/audio';

interface FeedbackModalProps {
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [rating, setRating] = useState(5);
  const [selectedLang, setSelectedLang] = useState('Hindi');
  const [humAccuracy, setHumAccuracy] = useState('Spot On! 🎯');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playChime();
    triggerConfetti();
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl neo-box-lg p-6 sm:p-7 relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FF6B6B] border border-black">
              <Sparkles className="w-4 h-4 text-black" />
            </span>
            <h3 className="font-display font-black text-xl text-black">
              FineTune Feedback
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

        {isSubmitted ? (
          <div className="py-8 flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#6EE7B7] border-[2.5px] border-black flex items-center justify-center shadow-[3px_3px_0px_#000] mb-4">
              <CheckCircle2 className="w-10 h-10 text-black" />
            </div>
            <h4 className="font-display font-black text-2xl text-black">
              Shukriya! Thank You! 💖
            </h4>
            <p className="text-sm font-bold text-zinc-600 mt-2 max-w-xs leading-relaxed">
              Your feedback helps FineTune hum in every corner of India!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className="text-xs font-black uppercase text-zinc-700 block mb-1.5">
                How was your humming match experience?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      playPop(400 + star * 60);
                      setRating(star);
                    }}
                    className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center transition-all cursor-pointer ${
                      star <= rating
                        ? 'bg-[#FDE047] shadow-[2px_2px_0px_#000] scale-105'
                        : 'bg-zinc-100 hover:bg-zinc-200'
                    }`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'text-black fill-black'
                          : 'text-zinc-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Language */}
            <div>
              <label className="text-xs font-black uppercase text-zinc-700 block mb-1.5">
                What language were you humming in?
              </label>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="w-full p-2.5 rounded-xl border-2 border-black bg-[#FAF7F2] font-bold text-sm text-black focus:outline-none shadow-[2px_2px_0px_#000]"
              >
                {INDIAN_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>
                    {l.flag} {l.name} ({l.native})
                  </option>
                ))}
              </select>
            </div>

            {/* Humming Accuracy Perception */}
            <div>
              <label className="text-xs font-black uppercase text-zinc-700 block mb-1.5">
                Recognition Accuracy:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Spot On! 🎯', 'Very Close 👍', 'Missed It ❌'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      playPop(520);
                      setHumAccuracy(opt);
                    }}
                    className={`p-2 rounded-xl border-2 border-black text-xs font-black text-center cursor-pointer transition-all ${
                      humAccuracy === opt
                        ? 'bg-[#6EE7B7] shadow-[2px_2px_0px_#000]'
                        : 'bg-[#FAF7F2] hover:bg-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="text-xs font-black uppercase text-zinc-700 block mb-1.5">
                Any songs or regional languages we should add?
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="e.g. Add more Malayalam melody hooks or Coke Studio songs..."
                className="w-full p-2.5 rounded-xl border-2 border-black bg-[#FAF7F2] font-semibold text-sm text-black focus:outline-none shadow-[2px_2px_0px_#000] resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#FF6B6B] hover:bg-[#ff5555] text-black font-black text-base rounded-2xl border-[2.5px] border-black shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>SUBMIT FEEDBACK</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
