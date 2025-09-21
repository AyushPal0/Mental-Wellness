'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const OCD_SEVERITY_LEVELS = [
  { score: 0, label: "None", description: "No significant OCD traits detected", color: "text-green-400" },
  { score: 20, label: "Mild", description: "Minor organizational preferences", color: "text-blue-400" },
  { score: 40, label: "Moderate", description: "Noticeable need for order and symmetry", color: "text-yellow-400" },
  { score: 60, label: "Significant", description: "Strong compulsion for arrangement", color: "text-orange-400" },
  { score: 80, label: "Severe", description: "Clinical level OCD tendencies", color: "text-red-400" }
];

const GAME_LEVELS = [
  { id: 1, name: "Neat Arrangement", description: "A perfectly organized table", items: [ { id: "book1", type: "book", width: 80, height: 120, x: 100, y: 100, rotation: 0, color: '#8B4513' }, { id: "cup1", type: "cup", width: 60, height: 80, x: 250, y: 100, rotation: 0, color: '#87CEEB' }, { id: "plate1", type: "plate", width: 70, height: 70, x: 400, y: 100, rotation: 0, color: '#FFF8DC' } ], triggerQuestion: "How comfortable are you with this arrangement?", disorderIntensity: 1 },
  { id: 2, name: "Slightly Messy", description: "The table is slightly disorganized", items: [ { id: "book1", type: "book", width: 80, height: 120, x: 120, y: 120, rotation: 15, color: '#8B4513' }, { id: "cup1", type: "cup", width: 60, height: 80, x: 270, y: 110, rotation: -10, color: '#87CEEB' }, { id: "plate1", type: "plate", width: 70, height: 70, x: 390, y: 90, rotation: 5, color: '#FFF8DC' }, { id: "pen1", type: "pen", width: 40, height: 120, x: 200, y: 250, rotation: 45, color: '#2c3e50' } ], triggerQuestion: "Does this slight disorder bother you?", disorderIntensity: 2 },
  { id: 3, name: "Moderately Messy", description: "Items are noticeably disorganized", items: [ { id: "book1", type: "book", width: 80, height: 120, x: 140, y: 140, rotation: 25, color: '#8B4513' }, { id: "cup1", type: "cup", width: 60, height: 80, x: 290, y: 120, rotation: -20, color: '#87CEEB' }, { id: "plate1", type: "plate", width: 70, height: 70, x: 380, y: 80, rotation: 15, color: '#FFF8DC' }, { id: "pen1", type: "pen", width: 40, height: 120, x: 220, y: 260, rotation: 65, color: '#2c3e50' }, { id: "book2", type: "book", width: 70, height: 100, x: 170, y: 280, rotation: -15, color: '#8B0000' } ], triggerQuestion: "Is this level of disorder uncomfortable for you?", disorderIntensity: 3 },
  { id: 4, name: "Very Messy", description: "The table is quite disorganized", items: [ { id: "book1", type: "book", width: 80, height: 120, x: 160, y: 160, rotation: 35, color: '#8B4513' }, { id: "cup1", type: "cup", width: 60, height: 80, x: 310, y: 130, rotation: -30, color: '#87CEEB' }, { id: "plate1", type: "plate", width: 70, height: 70, x: 370, y: 70, rotation: 25, color: '#FFF8DC' }, { id: "pen1", type: "pen", width: 40, height: 120, x: 240, y: 270, rotation: 85, color: '#2c3e50' }, { id: "book2", type: "book", width: 70, height: 100, x: 190, y: 290, rotation: -25, color: '#8B0000' }, { id: "notebook1", type: "notebook", width: 90, height: 110, x: 330, y: 190, rotation: 15, color: '#4B0082' } ], triggerQuestion: "Does this messy arrangement trigger your OCD?", disorderIntensity: 4 },
  { id: 5, name: "Extremely Messy", description: "The table is highly disorganized", items: [ { id: "book1", type: "book", width: 80, height: 120, x: 180, y: 180, rotation: 45, color: '#8B4513' }, { id: "cup1", type: "cup", width: 60, height: 80, x: 330, y: 140, rotation: -40, color: '#87CEEB' }, { id: "plate1", type: "plate", width: 70, height: 70, x: 360, y: 60, rotation: 35, color: '#FFF8DC' }, { id: "pen1", type: "pen", width: 40, height: 120, x: 260, y: 280, rotation: 105, color: '#2c3e50' }, { id: "book2", type: "book", width: 70, height: 100, x: 210, y: 300, rotation: -35, color: '#8B0000' }, { id: "notebook1", type: "notebook", width: 90, height: 110, x: 350, y: 210, rotation: 25, color: '#4B0082' }, { id: "cup2", type: "cup", width: 50, height: 70, x: 280, y: 150, rotation: -15, color: '#FF6347' }, { id: "paper1", type: "paper", width: 100, height: 80, x: 400, y: 250, rotation: 10, color: '#FFFFFF' } ], triggerQuestion: "How strongly does this extreme disorder affect you?", disorderIntensity: 5 }
];

interface UserResponse {
  level: number;
  intensity: number;
  response: number;
}

export default function GamePlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';
  const userId = searchParams.get('userId');

  const [currentLevel, setCurrentLevel] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [ocdScore, setOcdScore] = useState(0);
  const [severityLevel, setSeverityLevel] = useState(OCD_SEVERITY_LEVELS[0]);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [showTriggerQuestion, setShowTriggerQuestion] = useState(false);
  const [viewTime, setViewTime] = useState(0);
  const [hasSeenTable, setHasSeenTable] = useState(false);
  const viewTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentLevelData = GAME_LEVELS[currentLevel];

  useEffect(() => {
    setViewTime(0);
    setShowTriggerQuestion(false);
    setHasSeenTable(false);
    
    if (viewTimerRef.current) clearInterval(viewTimerRef.current);
    
    viewTimerRef.current = setInterval(() => setViewTime(prev => prev + 1), 1000);
    
    return () => {
      if (viewTimerRef.current) clearInterval(viewTimerRef.current);
    };
  }, [currentLevel]);

  const handleReadyToAnswer = () => {
    setHasSeenTable(true);
    setShowTriggerQuestion(true);
    if (viewTimerRef.current) clearInterval(viewTimerRef.current);
  };

  const handleUserResponse = (response: number) => {
    setUserResponses(prev => [...prev, {
      level: currentLevel + 1,
      intensity: currentLevelData.disorderIntensity,
      response: response
    }]);

    setShowTriggerQuestion(false);
    
    if (currentLevel + 1 < GAME_LEVELS.length) {
      setTimeout(() => setCurrentLevel(prev => prev + 1), 1000);
    } else {
      calculateFinalOCDScore();
      setIsCompleted(true);
    }
  };
  
  const handleOnboardingComplete = async () => {
      if (!userId) return;
      try {
          await fetch('http://127.0.0.1:5000/api/onboarding/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: userId, step: 'game', status: 'completed' }),
          });
          router.push(`/onboarding/tasks?userId=${userId}`);
      } catch (error) {
          console.error("Failed to update onboarding status:", error);
          router.push(`/onboarding/tasks?userId=${userId}`);
      }
  };


  const calculateFinalOCDScore = () => {
    const responseScore = userResponses.reduce((sum, response) => sum + (response.response * response.intensity * 3), 0);
    const avgResponseScore = Math.min(100, responseScore / Math.max(1, userResponses.length));
    const totalViewTime = userResponses.reduce((sum, _, index) => sum + (5 + index * 2), 0);
    const timeScore = Math.min(100, totalViewTime * 1.5);
    const finalScore = Math.round((avgResponseScore * 0.8) + (timeScore * 0.2));
    setOcdScore(Math.min(100, finalScore));
    setSeverityLevel(getSeverityLevel(finalScore));
  };

  const getSeverityLevel = (score: number) => {
    for (let i = OCD_SEVERITY_LEVELS.length - 1; i >= 0; i--) {
      if (score >= OCD_SEVERITY_LEVELS[i].score) return OCD_SEVERITY_LEVELS[i];
    }
    return OCD_SEVERITY_LEVELS[0];
  };

  const TableItem = ({ item }: { item: typeof currentLevelData.items[0] }) => {
    return (
      <div
        className="item absolute transition-all duration-500"
        style={{
          left: item.x - item.width/2, top: item.y - item.height/2, width: item.width, height: item.height,
          transform: `rotate(${item.rotation}deg)`, backgroundColor: item.color,
          borderRadius: item.type === 'plate' ? '50%' : item.type === 'cup' ? '50% 50% 60% 60%' : '4px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)', border: item.type === 'paper' ? '1px solid #ccc' : 'none'
        }}
      >
        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </div>
      </div>
    );
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 flex items-center justify-center">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl p-8 max-w-4xl w-full shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              OCD Assessment Complete
            </h2>
            <p className="text-gray-400">Based on your responses to {GAME_LEVELS.length} levels of disorder</p>
          </div>
          
          <div className="bg-gray-700 rounded-2xl p-6 mb-8">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">{ocdScore}/100</div>
              <div className={`text-2xl font-bold ${severityLevel.color}`}>{severityLevel.label} Severity</div>
              <p className="text-gray-400 mt-2">{severityLevel.description}</p>
            </div>
            
            <div className="w-full bg-gray-600 rounded-full h-4 mb-2">
              <div 
                className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${ocdScore}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>None</span>
              <span>Mild</span>
              <span>Moderate</span>
              <span>Significant</span>
              <span>Severe</span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-4 text-center">Your Responses to Disorder</h3>
            <div className="space-y-3">
              {userResponses.map((response, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-400">Level {response.level} (Intensity: {response.intensity}/5):</span>
                  <span className="font-bold">
                    {response.response === 1 ? '😌 Comfortable' : 
                     response.response === 2 ? '🙂 Slight discomfort' : 
                     response.response === 3 ? '😐 Moderate discomfort' : 
                     response.response === 4 ? '😣 Quite uncomfortable' : 
                     '😫 Extremely uncomfortable'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-900 bg-opacity-30 rounded-2xl p-4 mb-8">
            <p className="text-sm text-blue-300 text-center">
              <strong>Note:</strong> This assessment is for informational purposes only and is not a clinical diagnosis. 
              If you have concerns about OCD, please consult a mental health professional.
            </p>
          </div>
          
          <div className="flex space-x-4">
            {isOnboarding ? (
                <button 
                  onClick={handleOnboardingComplete}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300"
                >
                  Continue to Next Step
                </button>
            ) : (
                <>
                    <button 
                      onClick={() => window.location.reload()}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300"
                    >
                      Retake Assessment
                    </button>
                    <button 
                      onClick={() => router.push('/game/intro')}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-all duration-300"
                    >
                      Main Menu
                    </button>
                </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              OCD Trigger Assessment
            </h1>
            <p className="text-gray-400 text-sm">Level {currentLevel + 1} of {GAME_LEVELS.length}: {currentLevelData.name}</p>
          </div>
          <div className="bg-gray-800 rounded-xl px-4 py-2 border border-gray-700">
            <span className="text-sm text-gray-400 mr-2">VIEWING TIME</span>
            <span className="font-bold text-xl">{viewTime}s</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700 shadow-xl text-center">
          <h2 className="text-xl font-semibold text-gray-300 mb-2">
            {currentLevelData.description}
          </h2>
          <p className="text-gray-500">
            Observe the table arrangement and respond how it makes you feel
          </p>
          <div className="mt-4">
            <span className="text-sm text-gray-400">Disorder Intensity: </span>
            <span className="font-bold text-yellow-400">{currentLevelData.disorderIntensity}/5</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl mb-8">
          <div 
            className="game-table mx-auto relative bg-gray-900 border-2 border-gray-700 rounded-xl overflow-hidden shadow-2xl"
            style={{ width: '700px', height: '450px' }}
          >
            <div className="absolute inset-0 opacity-20 bg-wood-pattern"></div>
            
            <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
                  backgroundSize: '50px 50px',
                  color: 'rgba(255, 255, 255, 0.1)'
                }}
            ></div>
            
            {currentLevelData.items.map(item => (
              <TableItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {!hasSeenTable && (
          <div className="text-center">
            <button 
              onClick={handleReadyToAnswer}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 text-lg"
            >
              I'm Ready to Answer
            </button>
          </div>
        )}
      </div>

      {showTriggerQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">How does this make you feel?</h2>
              <p className="text-gray-300 text-lg mb-2">{currentLevelData.description}</p>
              <p className="text-gray-400 text-sm">(Disorder level: {currentLevelData.disorderIntensity}/5)</p>
            </div>
            
            <div className="space-y-4">
              <button onClick={() => handleUserResponse(1)} className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all duration-300 text-lg">
                😌 Completely Comfortable
              </button>
              <button onClick={() => handleUserResponse(2)} className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all duration-300 text-lg">
                🙂 Slightly Uncomfortable
              </button>
              <button onClick={() => handleUserResponse(3)} className="w-full bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-all duration-300 text-lg">
                😐 Moderately Uncomfortable
              </button>
              <button onClick={() => handleUserResponse(4)} className="w-full bg-orange-700 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all duration-300 text-lg">
                😣 Quite Uncomfortable
              </button>
              <button onClick={() => handleUserResponse(5)} className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all duration-300 text-lg">
                😫 Extremely Uncomfortable
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .bg-wood-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%23755c39'/%3E%3Cpath d='M0 0l100 100M100 0L0 100' stroke='%235e4226' stroke-width='1' opacity='0.2'/%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
}