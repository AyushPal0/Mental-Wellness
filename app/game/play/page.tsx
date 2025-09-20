'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface GameItem {
  id: string;
  type: string;
  width: number;
  height: number;
  correct_x: number;
  correct_y: number;
  correct_rotation: number;
  start_x: number;
  start_y: number;
  start_rotation: number;
  color?: string;
}

interface Position {
  x: number;
  y: number;
  rotation: number;
}

interface GameState {
  sessionId: string | null;
  level: number;
  items: GameItem[];
  itemPositions: Record<string, Position>;
  completedItems: Set<string>;
  timeLeft: number;
  isPlaying: boolean;
  isCompleted: boolean;
}

interface Score {
  totalTime: number;
  corrections: number;
  precision: number;
  severityScore: number;
  interpretation: string;
}

export default function GamePlayPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    sessionId: null,
    level: 0,
    items: [],
    itemPositions: {},
    completedItems: new Set(),
    timeLeft: 0,
    isPlaying: false,
    isCompleted: false
  });

  const [score, setScore] = useState<Score>({
    totalTime: 0,
    corrections: 0,
    precision: 0,
    severityScore: 0,
    interpretation: ''
  });

  const [isDragging, setIsDragging] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start a new game session
  const startGame = async (level: number = 0) => {
    try {
      const response = await fetch('http://localhost:5000/api/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_type: 'ocd_table' })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Failed to start game:', data.error);
        return;
      }

      const initialPositions: Record<string, Position> = {};
      data.game_data.items.forEach((item: GameItem) => {
        initialPositions[item.id] = {
          x: item.start_x,
          y: item.start_y,
          rotation: item.start_rotation
        };
      });

      setGameState({
        sessionId: data.game_data.session_id,
        level: level,
        items: data.game_data.items,
        itemPositions: initialPositions,
        completedItems: new Set(),
        timeLeft: data.game_data.time_limit || 120,
        isPlaying: true,
        isCompleted: false
      });

      // Start timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            completeLevel();
            return { ...prev, timeLeft: 0, isPlaying: false };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  // Handle item movement
  const handleItemMove = (itemId: string, newX: number, newY: number) => {
    setGameState(prev => ({
      ...prev,
      itemPositions: {
        ...prev.itemPositions,
        [itemId]: { ...prev.itemPositions[itemId], x: newX, y: newY }
      }
    }));

    // Record the action
    recordAction(itemId, 'drag');
  };

  // Handle item rotation
  const handleItemRotate = (itemId: string, newRotation: number) => {
    setGameState(prev => ({
      ...prev,
      itemPositions: {
        ...prev.itemPositions,
        [itemId]: { ...prev.itemPositions[itemId], rotation: newRotation }
      }
    }));

    // Record the action
    recordAction(itemId, 'rotate');
  };

  // Record user action to backend
  const recordAction = async (itemId: string, actionType: string) => {
    if (!gameState.sessionId) return;

    try {
      const action = {
        session_id: gameState.sessionId,
        item_id: itemId,
        action_type: actionType,
        time_taken: 0.5,
        timestamp: Date.now() / 1000
      };

      await fetch('http://localhost:5000/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action)
      });

      // Increment corrections count for score
      setScore(prev => ({ ...prev, corrections: prev.corrections + 1 }));
    } catch (error) {
      console.error('Failed to record action:', error);
    }
  };

  // Check if an item is correctly placed
  const checkItemPlacement = async (itemId: string) => {
    try {
      const position = gameState.itemPositions[itemId];
      const response = await fetch('http://localhost:5000/api/game/check-placement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: itemId,
          x: position.x,
          y: position.y,
          rotation: position.rotation
        })
      });

      const result = await response.json();
      
      if (result.correctly_positioned) {
        setGameState(prev => ({
          ...prev,
          completedItems: new Set(prev.completedItems).add(itemId)
        }));
      }

      return result;
    } catch (error) {
      console.error('Failed to check placement:', error);
      return { correctly_positioned: false, distance: 0, rotation_diff: 0 };
    }
  };

  // Complete the level and calculate score
  const completeLevel = async () => {
    if (!gameState.sessionId || gameState.isCompleted) return;

    try {
      // Check all items
      const itemPositions = Object.entries(gameState.itemPositions).map(([id, pos]) => ({
        id,
        x: pos.x,
        y: pos.y,
        rotation: pos.rotation,
        correctly_positioned: gameState.completedItems.has(id)
      }));

      const response = await fetch('http://localhost:5000/api/game/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: gameState.sessionId,
          level: gameState.level,
          items: itemPositions,
          completion_time: gameState.timeLeft,
          corrections: score.corrections
        })
      });

      const result = await response.json();
      if (result.success) {
        setScore({
          totalTime: result.result.totalTime || 0,
          corrections: result.result.corrections || 0,
          precision: result.result.precision || 0,
          severityScore: result.result.severityScore || 0,
          interpretation: result.result.interpretation || ''
        });
        setGameState(prev => ({ ...prev, isPlaying: false, isCompleted: true }));
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (error) {
      console.error('Failed to complete level:', error);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start game on component mount
  useEffect(() => {
    startGame(0);
  }, []);

  // Draggable Item Component
  const DraggableItem = ({ item, position }: { item: GameItem, position: Position }) => {
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(item.id);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || isDragging !== item.id) return;
      
      const container = e.currentTarget.closest('.game-table');
      if (container) {
        const rect = container.getBoundingClientRect();
        const newX = e.clientX - rect.left - item.width / 2;
        const newY = e.clientY - rect.top - item.height / 2;
        handleItemMove(item.id, newX, newY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging === item.id) {
        setIsDragging(null);
        checkItemPlacement(item.id);
      }
    };

    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 5 : -5;
      const newRotation = (position.rotation + delta) % 360;
      handleItemRotate(item.id, newRotation);
    };

    return (
      <motion.div
        className={`item ${item.type} ${isDragging === item.id ? 'dragging' : ''}`}
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: item.width,
          height: item.height,
          transform: `rotate(${position.rotation}deg)`,
          backgroundColor: item.color || '#ddd',
          border: '2px solid #999',
          cursor: 'move',
          userSelect: 'none',
          zIndex: isDragging === item.id ? 1000 : 1
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Item content based on type */}
        {item.type === 'book' && (
          <div style={{ 
            background: 'linear-gradient(to right, #8B4513, #A0522D)', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontSize: '12px',
            borderRadius: '4px'
          }}>
            Book
          </div>
        )}
        {item.type === 'cup' && (
          <div style={{ 
            background: 'linear-gradient(to bottom, #87CEEB, #6495ED)', 
            height: '100%', 
            borderRadius: '50% 50% 60% 60%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontSize: '12px' 
          }}>
            Cup
          </div>
        )}
        {item.type === 'plate' && (
          <div style={{ 
            background: 'linear-gradient(to bottom, #FFF8DC, #F5F5DC)', 
            height: '100%', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#666', 
            fontSize: '12px', 
            border: '2px solid #ddd' 
          }}>
            Plate
          </div>
        )}
        {item.type === 'pen' && (
          <div style={{ 
            background: 'linear-gradient(to bottom, #333, #000)', 
            height: '100%', 
            width: '40%', 
            margin: '0 auto', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontSize: '10px',
            borderRadius: '2px'
          }}>
            Pen
          </div>
        )}
      </motion.div>
    );
  };

  if (!gameState.isPlaying && !gameState.isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header with progress and timer */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Table Arrangement Challenge</h1>
            <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-semibold">
              Level {gameState.level + 1}
            </div>
          </div>
          
          <div className="mb-2 flex justify-between text-sm">
            <span>Time Left</span>
            <span className={`font-bold ${gameState.timeLeft <= 30 ? 'text-red-300' : ''}`}>
              {Math.floor(gameState.timeLeft / 60)}:{String(gameState.timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2 mb-4">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${(gameState.timeLeft / 120) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Items Arranged</span>
            <span>{gameState.completedItems.size} / {gameState.items.length}</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(gameState.completedItems.size / gameState.items.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Game content */}
        <div className="p-6">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Arrange the items neatly on the table
            </h2>
            <p className="text-gray-600">
              Drag to move items, scroll to rotate them
            </p>
          </div>

          {/* Game table */}
          <div 
            className="game-table mx-auto relative bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden"
            style={{ width: '600px', height: '400px' }}
            onMouseMove={(e) => {
              if (isDragging) {
                const item = gameState.items.find(i => i.id === isDragging);
                if (item) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const newX = e.clientX - rect.left - item.width / 2;
                  const newY = e.clientY - rect.top - item.height / 2;
                  handleItemMove(isDragging, newX, newY);
                }
              }
            }}
            onMouseUp={() => {
              if (isDragging) {
                checkItemPlacement(isDragging);
                setIsDragging(null);
              }
            }}
            onMouseLeave={() => {
              if (isDragging) {
                checkItemPlacement(isDragging);
                setIsDragging(null);
              }
            }}
          >
            {gameState.items.map(item => (
              <DraggableItem
                key={item.id}
                item={item}
                position={gameState.itemPositions[item.id]}
              />
            ))}
            
            {/* Table surface pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                 style={{
                   backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                   backgroundSize: '20px 20px',
                   backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                 }}
            />
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">How to play:</h3>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Click and drag items to move them around the table</li>
              <li>Use your mouse wheel to rotate items</li>
              <li>Try to arrange items neatly and symmetrically</li>
              <li>Click "Complete Level" when you're satisfied with your arrangement</li>
            </ul>
          </div>

          {/* Score and controls */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{score.corrections}</div>
                  <div className="text-sm text-gray-600">Adjustments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{gameState.completedItems.size}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{gameState.items.length - gameState.completedItems.size}</div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
              </div>
              
              <button 
                onClick={completeLevel}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
                disabled={!gameState.isPlaying}
              >
                Complete Level
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results modal */}
      {gameState.isCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-center mb-6">Level Complete!</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold">{score.totalTime.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Adjustments:</span>
                <span className="font-semibold">{score.corrections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Precision:</span>
                <span className="font-semibold">{score.precision.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
                <span className="text-gray-800">OCD Severity Score:</span>
                <span className="text-purple-600">{score.severityScore.toFixed(1)}</span>
              </div>
              <div className="text-center mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  score.interpretation === 'Mild' ? 'bg-green-100 text-green-800' :
                  score.interpretation === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {score.interpretation}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => startGame(gameState.level + 1)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                disabled={gameState.level >= 2}
              >
                Next Level
              </button>
              <button 
                onClick={() => router.push('/game/results')}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}