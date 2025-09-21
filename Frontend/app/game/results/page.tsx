'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Define the scores interface
interface GameScores {
  attention: number;
  anxiety: number;
  perseverance: number;
  overall: number;
}

export default function GameResultsPage() {
  const searchParams = useSearchParams();
  const [scores, setScores] = useState<GameScores | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Parse scores from URL parameters
    const scoresJson = searchParams.get('scores');
    if (scoresJson) {
      try {
        const parsedScores = JSON.parse(scoresJson);
        setScores(parsedScores);
      } catch (error) {
        console.error('Error parsing scores:', error);
      }
    }
    setIsLoading(false);
  }, [searchParams]);

  const getInterpretation = (attention: number, anxiety: number) => {
    if (attention > 0.7 && anxiety < 0.3) {
      return "Great focus today! You maintained attention while staying calm.";
    } else if (attention < 0.4 && anxiety > 0.6) {
      return "It seemed challenging to focus today. Remember that it's okay to take breaks when things feel overwhelming.";
    } else {
      return "You worked through the patterns today. Notice how you responded to challenges - this awareness helps build resilience.";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return '🎯';
    if (score >= 0.6) return '👍';
    return '💪';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!scores) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Results Not Available</h1>
            <p className="text-gray-600 mb-6">We couldn't retrieve your game results. Please try playing again.</p>
            <Link 
              href="/game/intro" 
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Play Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">Game Results</h1>
          <p className="opacity-90">Your pattern recognition performance</p>
        </div>

        {/* Scores */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Scores</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{(scores.attention * 100).toFixed(0)}%</div>
              <div className="text-sm text-blue-800 font-medium">Attention</div>
              <div className="text-xs text-blue-600 mt-1">{getScoreIcon(scores.attention)}</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">{(scores.anxiety * 100).toFixed(0)}%</div>
              <div className="text-sm text-purple-800 font-medium">Anxiety</div>
              <div className="text-xs text-purple-600 mt-1">{getScoreIcon(1 - scores.anxiety)}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{(scores.perseverance * 100).toFixed(0)}%</div>
              <div className="text-sm text-green-800 font-medium">Perseverance</div>
              <div className="text-xs text-green-600 mt-1">{getScoreIcon(scores.perseverance)}</div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">{(scores.overall * 100).toFixed(0)}%</div>
              <div className="text-sm text-orange-800 font-medium">Overall</div>
              <div className="text-xs text-orange-600 mt-1">{getScoreIcon(scores.overall)}</div>
            </div>
          </div>
          
          {/* Interpretation */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Interpretation</h3>
            <p className="text-gray-700">{getInterpretation(scores.attention, scores.anxiety)}</p>
          </div>
          
          {/* Progress bars for visual representation */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Performance Breakdown</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-700 font-medium">Attention</span>
                  <span className={getScoreColor(scores.attention)}>{(scores.attention * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${scores.attention * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-700 font-medium">Calmness</span>
                  <span className={getScoreColor(1 - scores.anxiety)}>{((1 - scores.anxiety) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${(1 - scores.anxiety) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-700 font-medium">Perseverance</span>
                  <span className={getScoreColor(scores.perseverance)}>{(scores.perseverance * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${scores.perseverance * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Link 
              href="/game/intro" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Play Again
            </Link>
            <Link 
              href="/" 
              className="bg-gray-100 text-gray-800 text-center py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}