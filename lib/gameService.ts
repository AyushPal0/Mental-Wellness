// File: lib/gameService.ts

// Use environment variable with fallback to '/api'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Debug log to check the environment variable
console.log('API_BASE_URL:', API_BASE_URL);

export const gameService = {
  startGame: async (gameType: string) => {
    try {
      console.log('Calling API endpoint:', `${API_BASE_URL}/game/ocd/start`);
      
      const response = await fetch(`${API_BASE_URL}/game/ocd/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error starting game:', error);
      console.log('Falling back to mock data');
      // Return mock data as fallback
      return getMockGameData();
    }
  },

  completeGame: async (results: any) => {
    try {
      console.log('Calling API endpoint:', `${API_BASE_URL}/game/ocd/complete`);
      
      const response = await fetch(`${API_BASE_URL}/game/ocd/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(results),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error completing game:', error);
      console.log('Falling back to mock scores');
      // Return mock scores as fallback
      return getMockScores(results);
    }
  }
};

// Helper functions for mock data
function getMockGameData() {
  return {
    session_id: `mock-session-${Date.now()}`,
    patterns: [
      {
        level: 1,
        sequence: [
          { shape: 'circle', color: '#FF6B6B', position: 0 },
          { shape: 'square', color: '#4ECDC4', position: 1 },
          { shape: 'triangle', color: '#FFE66D', position: 2 }
        ],
        correct_option: 0,
        distractors: [
          { shape: 'circle', color: '#FF6B6B' },
          { shape: 'square', color: '#45B7D1' },
          { shape: 'star', color: '#96CEB4' }
        ]
      },
      {
        level: 2,
        sequence: [
          { shape: 'circle', color: '#FF6B6B', position: 0 },
          { shape: 'square', color: '#4ECDC4', position: 1 },
          { shape: 'triangle', color: '#FFE66D', position: 2 },
          { shape: 'circle', color: '#FF9F68', position: 3 }
        ],
        correct_option: 2,
        distractors: [
          { shape: 'triangle', color: '#FFE66D' },
          { shape: 'square', color: '#FF9F68' },
          { shape: 'circle', color: '#4ECDC4' }
        ]
      }
    ]
  };
}

function getMockScores(results: any) {
  const accuracy = results.correct_count / results.total_patterns;
  const timeFactor = Math.max(0, 1 - (results.completion_time / 120));
  const correctionPenalty = 0.9 ** results.corrections_made;
  
  const mockScores = {
    attention: parseFloat((0.7 + (accuracy * 0.3) * correctionPenalty).toFixed(2)),
    anxiety: parseFloat((0.3 - (accuracy * 0.25) * (1 + (results.retries * 0.1))).toFixed(2)),
    perseverance: parseFloat((0.6 + (accuracy * 0.4) * timeFactor).toFixed(2)),
    overall: parseFloat(((accuracy * 0.4 + timeFactor * 0.3 + correctionPenalty * 0.3) * 0.95).toFixed(2))
  };
  
  return { scores: mockScores };
}

// Your existing types...
export interface GamePattern {
  level: number;
  sequence: Array<{
    shape: string;
    color: string;
    position: number;
  }>;
  correct_option: number;
  distractors: Array<{
    shape: string;
    color: string;
  }>;
}

export interface GameSession {
  session_id: string;
  patterns: GamePattern[];
}

export interface GameScores {
  attention: number;
  anxiety: number;
  perseverance: number;
  overall: number;
}

export interface GameResults {
  session_id: string;
  correct_count: number;
  total_patterns: number;
  completion_time: number;
  corrections_made: number;
  perfection_clicks: number;
  patterns_completed: number;
  patterns_started: number;
  retries: number;
}