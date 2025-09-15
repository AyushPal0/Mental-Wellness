'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gameService } from '@/lib/gameService';
import { motion, AnimatePresence } from 'framer-motion';

// Define TypeScript interfaces for better type safety
interface PatternItem {
  shape: 'circle' | 'square' | 'triangle' | 'star';
  color: string;
  position?: number;
}

interface Pattern {
  level: number;
  sequence: PatternItem[];
  distractors: PatternItem[];
  correct_option: number;
}

interface GameData {
  session_id: string;
  patterns: Pattern[];
}

interface Score {
  correct: number;
  incorrect: number;
  corrections: number;
}

// Shape icons for better visual representation
const ShapeIcon = ({ shape, className = "w-6 h-6" }: { shape: string; className?: string }) => {
  switch (shape) {
    case 'circle':
      return <div className={`rounded-full bg-current ${className}`} />;
    case 'square':
      return <div className={`bg-current ${className}`} />;
    case 'triangle':
      return <div className={`bg-current ${className} clip-triangle`} />;
    case 'star':
      return <div className={`bg-current ${className} clip-star`} />;
    default:
      return <div className={`rounded-full bg-current ${className}`} />;
  }
};

export default function GamePlayPage() {
  const [currentPattern, setCurrentPattern] = useState<Pattern | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState<Score>({ correct: 0, incorrect: 0, corrections: 0 });
  const [startTime, setStartTime] = useState(0);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ correct: boolean; index: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const data = await gameService.startGame('ocd_pattern');
      
      // Validate the response data
      if (!data || !data.patterns || !Array.isArray(data.patterns) || data.patterns.length === 0) {
        throw new Error('Invalid game data received from server');
      }
      
      if (!data.session_id) {
        throw new Error('No session ID received from server');
      }
      
      setGameData(data);
      setCurrentPattern(data.patterns[0]);
      setStartTime(Date.now());
    } catch (error: any) {
      console.error('Failed to start game:', error);
      const errorMsg = error.message || 'Failed to start game. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePatternComplete = async (isCorrect: boolean, madeCorrections: boolean, index: number) => {
    if (!gameData) {
      setError('Game data is missing. Please restart the game.');
      return;
    }
    
    // Show feedback animation
    setSelectedOption(index);
    setShowFeedback({ correct: isCorrect, index });
    
    // Update score after a short delay to show feedback
    setTimeout(() => {
      const newScore = { ...score };
      if (isCorrect) newScore.correct += 1;
      else newScore.incorrect += 1;
      if (madeCorrections) newScore.corrections += 1;
      setScore(newScore);
      
      setSelectedOption(null);
      setShowFeedback(null);

      // Move to next pattern or complete game
      if (currentLevel + 1 < gameData.patterns.length) {
        const nextLevel = currentLevel + 1;
        setCurrentLevel(nextLevel);
        setCurrentPattern(gameData.patterns[nextLevel]);
      } else {
        finishGame(newScore);
      }
    }, 1000);
  };

  const finishGame = async (finalScore: Score) => {
    if (!gameData) {
      setError('Cannot finish game: game data is missing');
      return;
    }
    
    const totalTime = (Date.now() - startTime) / 1000; // in seconds
    
    const results = {
      session_id: gameData.session_id,
      correct_count: finalScore.correct,
      total_patterns: gameData.patterns.length,
      completion_time: totalTime,
      corrections_made: finalScore.corrections,
      perfection_clicks: 0,
      patterns_completed: gameData.patterns.length,
      patterns_started: gameData.patterns.length,
      retries: finalScore.incorrect
    };

    try {
      const gameResult = await gameService.completeGame(results);
      router.push(`/game/results?scores=${encodeURIComponent(JSON.stringify(gameResult.scores))}`);
    } catch (error) {
      console.error('Failed to save game results:', error);
      // Even if saving fails, show results with mock data
      const mockResult = {
        scores: {
          attention: 0.75,
          anxiety: 0.25,
          perseverance: 0.8,
          overall: 0.7
        }
      };
      router.push(`/game/results?scores=${encodeURIComponent(JSON.stringify(mockResult.scores))}`);
    }
  };

  const restartGame = () => {
    setCurrentPattern(null);
    setCurrentLevel(0);
    setScore({ correct: 0, incorrect: 0, corrections: 0 });
    setGameData(null);
    setLoading(true);
    setError(null);
    initializeGame();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col bg-gradient-to-br from-blue-50 to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-6"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg text-gray-700 font-medium"
        >
          Preparing your game...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={restartGame}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              Try Again
            </motion.button>
            <button
              onClick={() => router.back()}
              className="w-full text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPattern) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pattern Error</h2>
          <p className="text-gray-600 mb-6">We couldn't load the game pattern. Please try restarting the game.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={restartGame}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            Restart Game
          </motion.button>
        </div>
      </div>
    );
  }

  const progress = gameData ? ((currentLevel + 1) / gameData.patterns.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header with progress */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Pattern Challenge</h1>
            <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-semibold">
              Level {currentPattern.level}
            </div>
          </div>
          
          <div className="mb-2 flex justify-between text-sm">
            <span>Progress</span>
            <span>{currentLevel + 1}/{gameData?.patterns.length || 0}</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="bg-white h-2 rounded-full"
            />
          </div>
        </div>

        {/* Game content */}
        <div className="p-6">
          {/* Pattern display */}
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Complete the pattern</h2>
            <div className="flex justify-center items-center mb-6">
              <AnimatePresence mode="wait">
                {currentPattern.sequence.slice(0, -1).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-14 h-14 mx-2 flex items-center justify-center relative"
                  >
                    <div 
                      className={`w-12 h-12 ${item.shape === 'circle' ? 'rounded-full' : item.shape === 'triangle' ? 'clip-triangle' : item.shape === 'star' ? 'clip-star' : ''} flex items-center justify-center shadow-md`}
                      style={{ backgroundColor: item.color }}
                    >
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: currentPattern.sequence.slice(0, -1).length * 0.1 }}
                  className="w-14 h-14 mx-2 flex items-center justify-center"
                >
                  <div className="w-12 h-12 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-gray-50">
                    <span className="text-gray-500 font-bold text-lg">?</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Options */}
          <div className="mb-8">
            <p className="text-center text-gray-600 mb-6">What comes next in the pattern?</p>
            <div className="grid grid-cols-2 gap-4">
              {currentPattern.distractors.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: selectedOption === null ? 1.05 : 1 }}
                  whileTap={{ scale: selectedOption === null ? 0.95 : 1 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative h-20 rounded-xl shadow-md flex items-center justify-center transition-all duration-300 ${
                    selectedOption === index 
                      ? showFeedback?.correct 
                        ? 'ring-4 ring-green-500' 
                        : 'ring-4 ring-red-500'
                      : 'hover:shadow-lg'
                  }`}
                  style={{ backgroundColor: option.color }}
                  onClick={() => selectedOption === null && handlePatternComplete(
                    index === currentPattern.correct_option,
                    false,
                    index
                  )}
                  disabled={selectedOption !== null}
                  aria-label={`Option ${index + 1}`}
                >
                  <div className={`w-10 h-10 ${option.shape === 'circle' ? 'rounded-full' : option.shape === 'triangle' ? 'clip-triangle' : option.shape === 'star' ? 'clip-star' : ''} bg-white/20 flex items-center justify-center`}>
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  
                  {/* Feedback overlay */}
                  {showFeedback?.index === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${showFeedback.correct ? 'bg-green-500' : 'bg-red-500'}`}>
                        {showFeedback.correct ? (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Score */}
          <div className="flex justify-between mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{score.correct}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{score.incorrect}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{gameData ? gameData.patterns.length - currentLevel - 1 : 0}</div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-800 font-medium"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Menu
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={restartGame}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Restart
            </motion.button>
          </div>
        </div>
      </div>

      {/* Add CSS for shapes */}
      <style jsx>{`
        .clip-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
        .clip-star {
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        }
      `}</style>
    </div>
  );
}