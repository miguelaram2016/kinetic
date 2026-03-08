'use client';

import { useState } from 'react';
import { getExerciseByName } from '@/lib/exercise-utils';

interface ExerciseDetailProps {
  exerciseName: string;
  compact?: boolean;
}

export default function ExerciseDetail({ exerciseName, compact = false }: ExerciseDetailProps) {
  const [expanded, setExpanded] = useState(false);
  const exercise = getExerciseByName(exerciseName);

  if (!exercise) {
    return (
      <div className="text-gray-500 text-sm italic">
        No details available for {exerciseName}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="text-sm">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-primary hover:text-primary-400 text-xs flex items-center gap-1"
        >
          {expanded ? '▼' : '▶'} View details
        </button>
        {expanded && (
          <div className="mt-2 text-gray-300 text-xs">
            {exercise.instructions.slice(0, 2).map((step, i) => (
              <p key={i} className="mb-1">• {step}</p>
            ))}
            {exercise.instructions.length > 2 && (
              <p className="text-gray-500">+{exercise.instructions.length - 2} more steps</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{exercise.name}</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {exercise.muscleGroups.map(m => (
              <span key={m} className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                {m}
              </span>
            ))}
            {exercise.secondaryMuscles.length > 0 && (
              <>
                {exercise.secondaryMuscles.slice(0, 3).map(m => (
                  <span key={m} className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">
                    {m}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          exercise.difficulty === 'beginner' ? 'bg-green-900 text-green-300' :
          exercise.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-300' :
          'bg-red-900 text-red-300'
        }`}>
          {exercise.difficulty}
        </span>
      </div>

      {/* Equipment */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-1">Equipment</h4>
        <div className="flex flex-wrap gap-2">
          {exercise.equipment.map(e => (
            <span key={e} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
              {e}
            </span>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2">Instructions</h4>
        <ol className="space-y-2">
          {exercise.instructions.map((step, index) => (
            <li key={index} className="flex gap-3 text-sm text-gray-300">
              <span className="text-primary font-medium min-w-[24px]">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Tips */}
      {exercise.tips.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Tips</h4>
          <ul className="space-y-1">
            {exercise.tips.map((tip, index) => (
              <li key={index} className="flex gap-2 text-sm text-gray-400">
                <span className="text-yellow-500">★</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Video */}
      {exercise.videoUrl && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Video Guide</h4>
          <a
            href={exercise.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-400 text-sm"
          >
            ▶ Watch Tutorial
          </a>
        </div>
      )}
    </div>
  );
}
