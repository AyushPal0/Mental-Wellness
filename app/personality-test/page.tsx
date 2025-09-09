// app/personality-test/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from "@/components/footer"

interface Question {
  id: number;
  text: string;
  dimension: string;
}

interface Answer {
  questionId: number;
  value: number;
}

// VideoBackground component included directly
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
    
    // Set video properties for background behavior
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    
    // Attempt to play the video
    const playVideo = () => {
      video.play().catch(error => {
        console.log("Video play failed:", error);
      });
    };
    
    playVideo();

    // Clean up
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
        {/* Fallback for browsers that don't support video */}
        <div className="absolute inset-0 bg-black flex items-center justify-center text-white">
          Your browser does not support the video tag.
        </div>
      </video>
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
    </div>
  );
};

export default function PersonalityTestPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample questions - replace with your friend's API data
  const questions: Question[] = [
    { id: 1, text: "I feel energized after spending time with others", dimension: "extraversion" },
    { id: 2, text: "I tend to expect positive outcomes in most situations", dimension: "optimism" },
    { id: 3, text: "I prefer having a structured routine rather than spontaneous plans", dimension: "structure" },
    { id: 4, text: "When stressed, I prefer to talk through my feelings with others", dimension: "coping" },
    { id: 5, text: "I often find myself getting lost in my thoughts", dimension: "introspection" },
    { id: 6, text: "I believe that most challenges can be overcome with effort", dimension: "optimism" },
    { id: 7, text: "I enjoy trying new experiences even if they're outside my comfort zone", dimension: "openness" },
    { id: 8, text: "I prefer working independently rather than in groups", dimension: "independence" },
    { id: 9, text: "I find it easy to adapt when plans change suddenly", dimension: "flexibility" },
    { id: 10, text: "I often notice small details that others might miss", dimension: "observation" },
  ];

  const handleAnswer = (value: number) => {
    const newAnswers = answers.filter(a => a.questionId !== questions[currentQuestionIndex].id);
    newAnswers.push({ questionId: questions[currentQuestionIndex].id, value });
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handleSubmit = async (finalAnswers: Answer[]) => {
    setIsSubmitting(true);
    try {
      // Call your friend's API here
      const response = await fetch('/api/personality-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit personality test');
      }

      const results = await response.json();
      
      // Redirect to dashboard or results page
      router.push('/dashboard?results=complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (error) {
    return (
      <main className="h-[100dvh] w-full overflow-hidden relative">
        <VideoBackground />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="bg-black bg-opacity-70 p-8 rounded-lg max-w-md text-center mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
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
          <div className="flex justify-between text-gray-300 text-sm px-1">
            <span>Disagree</span>
            <span>Neutral</span>
            <span>Agree</span>
          </div>

          {isSubmitting && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <p className="text-white mt-2">Processing your answers...</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}