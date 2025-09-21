// app/personality-test/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  text: string;
  dimension: string[];
}

interface Answer {
  questionId: number;
  value: number;
}

// VideoBackground component
const VideoBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setLoaded(true);
      video.play().catch(error => {
        console.log("Video autoplay failed:", error);
      });
    };

    video.addEventListener('canplay', handleCanPlay);
    
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    
    const playVideo = () => {
      video.play().catch(error => {
        console.log("Video play failed:", error);
      });
    };
    
    playVideo();

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
      <video
        ref={videoRef}
        className="absolute min-w-full min-h-full w-auto h-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/2882620-hd_1920_1080_30fps.mp4" type="video/mp4" />
        <div className="absolute inset-0 bg-black flex items-center justify-center text-white">
          Your browser does not support the video tag.
        </div>
      </video>
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
    </div>
  );
};

// API base URL - adjust this to match your Flask backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function PersonalityTestPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions from Flask backend API when component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/personality/questions`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.questions) {
          // Transform questions to match the expected format
          const formattedQuestions = data.questions.map((q: any) => ({
            id: q.id,
            text: q.question, // Use 'question' field from backend
            dimension: q.dimension // This should be an array like ["I", "E"]
          }));
          
          setQuestions(formattedQuestions);
        } else {
          throw new Error(data.error || 'Invalid response format from server');
        }
        } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
        console.error('Error fetching questions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswer = (value: number) => {
    if (!questions.length) return;

    const newAnswers = answers.filter(a => a.questionId !== questions[currentQuestionIndex].id);
    newAnswers.push({ 
      questionId: questions[currentQuestionIndex].id, 
      value 
    });
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit(newAnswers);
    }
  };

  // Calculate MBTI scores from answers
  const calculateScores = (answers: Answer[], questions: Question[]) => {
    const scores: { [key: string]: number } = {
      'I': 0, 'E': 0, 'N': 0, 'S': 0, 'T': 0, 'F': 0, 'J': 0, 'P': 0
    };

    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (question && question.dimension && question.dimension.length === 2) {
        const [dim1, dim2] = question.dimension;
        
        // For MBTI questions, answer value 1-5 where:
        // 1-2: Strongly lean toward dim1
        // 3: Neutral
        // 4-5: Strongly lean toward dim2
        if (answer.value <= 2) {
          scores[dim1] += (3 - answer.value); // More points for stronger agreement
        } else if (answer.value >= 4) {
          scores[dim2] += (answer.value - 2); // More points for stronger agreement
        }
        // Neutral answers (value 3) don't contribute to either side
      }
    });

    return scores;
  };

  // Determine personality type from scores
  const determinePersonalityType = (scores: { [key: string]: number }) => {
    let personalityType = '';
    
    // E vs I
    personalityType += scores.E > scores.I ? 'E' : 'I';
    
    // N vs S
    personalityType += scores.N > scores.S ? 'N' : 'S';
    
    // T vs F
    personalityType += scores.T > scores.F ? 'T' : 'F';
    
    // J vs P
    personalityType += scores.J > scores.P ? 'J' : 'P';
    
    return personalityType;
  };

  const handleSubmit = async (finalAnswers: Answer[]) => {
    setIsSubmitting(true);
    try {
      // Calculate scores from answers
      const scores = calculateScores(finalAnswers, questions);
      const personalityType = determinePersonalityType(scores);

      // Submit to Flask backend
      const response = await fetch(`${API_BASE_URL}/api/personality/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'anonymous-user', // Replace with actual user ID when you have auth
          scores: scores
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to submit: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Redirect to results page with the personality type
        router.push(`/results?type=${personalityType}`);
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting');
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (error) {
    return (
      <main className="h-[100dvh] w-full overflow-hidden relative">
        <VideoBackground />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="bg-black bg-opacity-70 p-8 rounded-lg max-w-md text-center mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setError(null)}
                className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition-all"
              >
                Try Again
              </button>
              <button 
                onClick={() => router.push('/')}
                className="bg-gray-600 text-white px-6 py-2 rounded-full font-medium hover:bg-gray-700 transition-all"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="h-[100dvh] w-full overflow-hidden relative">
        <VideoBackground />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="bg-black bg-opacity-70 p-8 rounded-lg max-w-md text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white mt-4">Loading questions from server...</p>
            <p className="text-gray-400 text-sm mt-2">Connecting to: {API_BASE_URL}</p>
          </div>
        </div>
      </main>
    );
  }

  if (questions.length === 0 && !isLoading) {
    return (
      <main className="h-[100dvh] w-full overflow-hidden relative">
        <VideoBackground />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="bg-black bg-opacity-70 p-8 rounded-lg max-w-md text-center">
            <h2 className="text-2xl font-bold text-white mb-4">No Questions Available</h2>
            <p className="text-gray-300 mb-4">The server returned no questions.</p>
            <p className="text-gray-400 text-sm">API URL: {API_BASE_URL}/api/personality/questions</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition-all mt-4"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-[100dvh] w-full overflow-hidden relative">
      <VideoBackground />
      
      {/* Progress Bar */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-80 max-w-full z-10">
        <div className="w-full bg-gray-700 bg-opacity-70 rounded-full h-2.5">
          <div 
            className="bg-white h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-white text-center mt-2 text-sm">
          {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Question Card */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="bg-black bg-opacity-70 p-8 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-semibold text-white mb-2 text-center">
            Question {currentQuestionIndex + 1}
          </h2>
          <p className="text-white text-lg mb-8 text-center">
            {questions[currentQuestionIndex]?.text}
          </p>
          
          {/* Answer Options */}
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleAnswer(value)}
                disabled={isSubmitting}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-medium text-lg
                  ${answers.find(a => a.questionId === questions[currentQuestionIndex]?.id)?.value === value
                    ? 'bg-white text-black' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                  } 
                  transition-colors duration-200`}
              >
                {value}
              </button>
            ))}
          </div>
          
          {/* Scale Labels */}
          <div className="flex justify-between text-gray-300 text-sm px-1 mb-2">
            <span>Strongly Disagree</span>
            <span>Neutral</span>
            <span>Strongly Agree</span>
          </div>

          {/* Dimension info (for debugging) */}
          <div className="text-center text-gray-400 text-xs mt-4">
            Dimension: {questions[currentQuestionIndex]?.dimension?.join(' vs ')}
          </div>

          {isSubmitting && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <p className="text-white mt-2">Processing your answers...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}