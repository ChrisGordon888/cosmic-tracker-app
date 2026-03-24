import { useState } from 'react';
import type { PuzzleConfig } from '@/lib/realmPuzzles';
import '@/styles/realmShared.css';

interface Props {
  puzzle: PuzzleConfig;
  onSolved: () => void;
}

/**
 * Reusable puzzle component used by all realm pages.
 * Purely presentational — validates client-side, fires onSolved() for the
 * parent to call completeTrialStep.
 */
export default function TrialPuzzle({ puzzle, onSolved }: Props) {
  const [inputValue,     setInputValue]     = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [feedback,       setFeedback]       = useState<'idle' | 'success' | 'fail'>('idle');
  const [showHint,       setShowHint]       = useState(false);

  const validate = () => {
    if (puzzle.type === 'multiple-choice') {
      if (selectedOption === puzzle.correctOption) {
        setFeedback('success');
        onSolved();
      } else {
        setFeedback('fail');
        setShowHint(true);
      }
    } else {
      // 'riddle' and 'text-clue' both use acceptedAnswers
      const normalized = inputValue.trim().toLowerCase();
      const correct = puzzle.acceptedAnswers?.some(
        (a) => a.toLowerCase() === normalized,
      ) ?? false;

      if (correct) {
        setFeedback('success');
        onSolved();
      } else {
        setFeedback('fail');
        setShowHint(true);
      }
    }
  };

  const typeLabel =
    puzzle.type === 'riddle'           ? '🧩 RIDDLE'        :
    puzzle.type === 'multiple-choice'  ? '📋 CHOOSE WISELY' :
                                         '🔍 CLUE';

  const canSubmit =
    puzzle.type === 'multiple-choice' ? !!selectedOption : !!inputValue.trim();

  // ── Success state ──────────────────────────────────────────────────────
  if (feedback === 'success') {
    return (
      <div className="glass-card p-6 text-center fade-in">
        <div className="text-4xl mb-3">✅</div>
        <p className="font-display text-glow text-lg">CORRECT — ADVANCING...</p>
      </div>
    );
  }

  // ── Puzzle UI ──────────────────────────────────────────────────────────
  return (
    <div className="glass-card p-6 fade-in">
      {/* Type badge */}
      <p className="text-xs font-display text-glow uppercase tracking-widest mb-3">
        {typeLabel}
      </p>

      {/* Prompt */}
      <p className="text-base text-secondary leading-relaxed mb-4">{puzzle.prompt}</p>

      {/* Error feedback */}
      {feedback === 'fail' && (
        <p className="text-red-400 text-sm mb-3">✗ Incorrect. Try again.</p>
      )}

      {/* Hint (shown after first wrong answer) */}
      {showHint && puzzle.hint && (
        <p className="text-yellow-300 text-sm italic mb-4">💡 {puzzle.hint}</p>
      )}

      {/* Multiple-choice options */}
      {puzzle.type === 'multiple-choice' ? (
        <div className="space-y-2 mb-4">
          {puzzle.options?.map((opt) => (
            <button
              key={opt}
              onClick={() => { setSelectedOption(opt); setFeedback('idle'); }}
              className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
              style={{
                background: selectedOption === opt
                  ? 'rgba(0,212,255,0.15)'
                  : 'rgba(255,255,255,0.05)',
                border: selectedOption === opt
                  ? '1px solid rgba(0,212,255,0.8)'
                  : '1px solid rgba(255,255,255,0.15)',
                color: '#E0E0E0',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        /* Text / riddle input */
        <input
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setFeedback('idle'); }}
          onKeyDown={(e) => { if (e.key === 'Enter' && canSubmit) validate(); }}
          placeholder="Enter your answer..."
          className="w-full px-4 py-3 rounded-xl mb-4 text-sm"
          style={{
            background:  'rgba(255,255,255,0.07)',
            border:      '1px solid rgba(0,212,255,0.4)',
            color:       '#F0F0F0',
            outline:     'none',
            fontFamily:  "'Space Grotesk', sans-serif",
          }}
        />
      )}

      {/* Submit */}
      <button
        onClick={validate}
        disabled={!canSubmit}
        className="btn-primary w-full"
        style={{ opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
      >
        SUBMIT ANSWER
      </button>

      {/* Lazy hint trigger */}
      {!showHint && puzzle.hint && (
        <button
          onClick={() => setShowHint(true)}
          className="w-full mt-2 text-xs text-muted transition-colors"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Need a hint?
        </button>
      )}
    </div>
  );
}