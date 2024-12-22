import React from 'react';

interface AnswerControlsProps {
  error: string | null;
  gameStatus: string;
  hasAnswered: boolean;
  isSubmitting: boolean;
  selectedLocation: [number, number] | null;
  onSubmit: () => void;
}

export default function AnswerControls({
  error,
  gameStatus,
  hasAnswered,
  isSubmitting,
  selectedLocation,
  onSubmit
}: AnswerControlsProps) {
  if (error) {
    return (
      <div className="text-center text-red-400 bg-red-900/20 rounded-lg p-4 mb-4">
        {error}
      </div>
    );
  }

  if (gameStatus === 'playing' && !hasAnswered) {
    return (
      <button
        onClick={onSubmit}
        disabled={!selectedLocation || isSubmitting}
        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800
                 text-white rounded-lg font-medium transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Answer'}
      </button>
    );
  }

  if (hasAnswered && gameStatus === 'playing') {
    return (
      <div className="text-center text-white text-lg bg-blue-500/20 rounded-lg p-4">
        Answer submitted! Waiting for other players...
      </div>
    );
  }

  return null;
}