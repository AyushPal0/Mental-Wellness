'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useOnboarding } from '@/components/context/OnboardingContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Question {
  id: number;
  text: string;
  dimension: string[];
}

// This interface defines the structure for a single answer
interface Answer {
  questionId: number;
  value: number;
}

export default function PersonalityTestPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const { updateStatus } = useOnboarding();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  // --- THIS IS THE KEY CHANGE ---
  // We will now store answers in an array that matches the `Answer` interface
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/personality/questions');
        if (response.ok) {
          const data = await response.json();
          const formattedQuestions = data.questions.map((q: any) => ({
            id: q.id,
            text: q.question,
            dimension: q.dimension,
          }));
          setQuestions(formattedQuestions);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswer = async (value: number) => {
    // This logic is now updated to store answers in the new format
    const newAnswers = [...answers.filter(a => a.questionId !== questions[currentQuestionIndex].id), { 
        questionId: questions[currentQuestionIndex].id, 
        value 
    }];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // --- THIS IS THE SECOND KEY CHANGE ---
      // We now send the raw answers to the backend for processing
      setIsLoading(true);
      await fetch('http://127.0.0.1:5000/api/personality/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, answers: newAnswers }), // Send the answers array
      });
      
      await updateStatus('personality_test', 'completed');
      router.push(`/onboarding/chatbot?userId=${userId}`);
    }
  };
  
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (isLoading && questions.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-white bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
          <motion.div
            className="bg-purple-500 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-center text-sm text-gray-400 mb-8">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        
        {questions.length > 0 && (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center"
            >
              <h2 className="text-2xl font-semibold mb-6">
                {questions[currentQuestionIndex].text}
              </h2>
              
              <div className="flex justify-between items-center my-6">
                <span className="text-sm text-gray-400">Disagree</span>
                <div className="flex gap-2 sm:gap-4">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <motion.button
                      key={value}
                      onClick={() => handleAnswer(value)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {value}
                    </motion.button>
                  ))}
                </div>
                <span className="text-sm text-gray-400">Agree</span>
              </div>
            </motion.div>
        )}
      </div>
    </div>
  );
}