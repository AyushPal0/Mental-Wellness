'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useOnboarding } from '@/components/context/OnboardingContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  dimension: string[];
}

interface Answer {
  questionId: number;
  value: number;
}

function PersonalityTestContent() {
  const { userId, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { updateStatus } = useOnboarding();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      if(!userId) return;
      setIsLoading(true);
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
  }, [userId]);

  const handleAnswer = async (value: number) => {
    const newAnswers = [...answers.filter(a => a.questionId !== questions[currentQuestionIndex].id), { 
        questionId: questions[currentQuestionIndex].id, 
        value 
    }];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsLoading(true);
      await fetch('http://127.0.0.1:5000/api/personality/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, answers: newAnswers }),
      });
      
      await updateStatus('personality_test', 'completed');
      router.push(`/onboarding/chatbot?userId=${userId}`);
    }
  };
  
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (authLoading || (isLoading && questions.length === 0)) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="h-full w-full text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <p className="text-center text-sm text-white/70 mb-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-8">
            <motion.div
              className="bg-purple-500 h-1.5 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
          </div>
        </motion.div>
        
        <AnimatePresence mode="wait">
          {questions.length > 0 && (
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <h2 className="text-2xl md:text-3xl font-semibold mb-8 min-h-[100px]">
                  {questions[currentQuestionIndex].text}
                </h2>
                
                <div className="flex justify-between items-center my-6 max-w-sm mx-auto">
                  <span className="text-sm text-white/60">Disagree</span>
                  <div className="flex gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((value, i) => (
                      <motion.button
                        key={value}
                        onClick={() => handleAnswer(value)}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.07, type: 'spring', stiffness: 200, damping: 15 }}
                        whileHover={{ scale: 1.15, y: -5, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg bg-white/10 transition-colors"
                      >
                        {value}
                      </motion.button>
                    ))}
                  </div>
                  <span className="text-sm text-white/60">Agree</span>
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


export default function PersonalityTestPage() {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <PersonalityTestContent />
        </Suspense>
    )
}