'use client';

import { useMemo, useState } from 'react';
import type { PuzzleConfig } from '@/lib/realmPuzzles';

interface TrialPuzzleProps {
  puzzle: PuzzleConfig;
  onSolved: () => void;
}

export default function TrialPuzzle({ puzzle, onSolved }: TrialPuzzleProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [feedback, setFeedback] = useState('');

  const showHint = attempts >= 2 && !!puzzle.hint;

  const normalizedAcceptedAnswers = useMemo(
    () => (puzzle.acceptedAnswers || []).map((answer) => answer.trim().toLowerCase()),
    [puzzle.acceptedAnswers]
  );

  const normalizedInput = inputValue.trim().toLowerCase();

  const handleSolveSuccess = () => {
    if (isSolved) return;

    setIsSolved(true);
    setFeedback('✅ Correct! Puzzle solved.');
    onSolved();
  };

  const handleWrongAnswer = () => {
    setAttempts((prev) => prev + 1);
    setFeedback('❌ Not quite. Try again.');
  };

  const handleSubmitTextAnswer = () => {
    if (isSolved) return;
    if (!normalizedInput) {
      setFeedback('⚠️ Enter an answer first.');
      return;
    }

    const isCorrect = normalizedAcceptedAnswers.includes(normalizedInput);

    if (isCorrect) {
      handleSolveSuccess();
    } else {
      handleWrongAnswer();
    }
  };

  const handleSelectOption = (option: string) => {
    if (isSolved) return;

    setSelectedOption(option);

    const isCorrect = option === puzzle.correctOption;

    if (isCorrect) {
      setIsSolved(true);
      setFeedback('✅ Correct! Puzzle solved.');
      onSolved();
    } else {
      setAttempts((prev) => prev + 1);
      setFeedback('❌ That sequence is not correct. Try again.');
    }
  };

  return (
    <div className="glass-card p-6 mt-4 border border-white/10">
      <div className="mb-4">
        <h4 className="text-lg font-display mb-2">🧩 Puzzle Challenge</h4>
        <p className="text-sm text-secondary">{puzzle.prompt}</p>
      </div>

      {(puzzle.type === 'riddle' || puzzle.type === 'text-clue') && (
        <div className="space-y-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your answer..."
            disabled={isSolved}
            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:border-white/30"
          />

          <button
            type="button"
            onClick={handleSubmitTextAnswer}
            disabled={isSolved}
            className="btn-secondary"
          >
            {isSolved ? 'PUZZLE SOLVED ✓' : 'SUBMIT ANSWER'}
          </button>
        </div>
      )}

      {puzzle.type === 'multiple-choice' && (
        <div className="space-y-3">
          {puzzle.options?.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrect = puzzle.correctOption === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelectOption(option)}
                disabled={isSolved}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                  isSolved && isCorrect
                    ? 'border-green-400 bg-green-500/10'
                    : isSelected
                      ? 'border-white/40 bg-white/10'
                      : 'border-white/10 bg-black/30 hover:border-white/30'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 min-h-[24px]">
        {feedback && <p className="text-sm">{feedback}</p>}
      </div>

      {showHint && !isSolved && (
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-muted mb-1">Hint</p>
          <p className="text-sm text-secondary">{puzzle.hint}</p>
        </div>
      )}
    </div>
  );
}