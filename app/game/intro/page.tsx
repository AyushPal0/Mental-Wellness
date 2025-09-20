'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function GameIntroPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  const gameTips = [
    "Observe each table arrangement carefully",
    "Rate how uncomfortable each arrangement makes you feel",
    "Be honest about your reactions - there are no right or wrong answers",
    "The assessment will progress through 5 levels of increasing disorder",
    "Your responses help understand organizational preferences"
  ];

  useEffect(() => {
    // Cycle through tips every 5 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % gameTips.length);
    }, 5000);

    return () => clearInterval(tipInterval);
  }, [gameTips.length]);

  const startGame = () => {
    setIsLoading(true);
    // Simulate loading before navigating
    setTimeout(() => {
      router.push('/game/play');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <motion.header 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            OCD ASSESSMENT
          </h1>
          <p className="text-xl text-gray-300">Observe and React to Different Table Arrangements</p>
        </motion.header>

        <div className="max-w-4xl mx-auto">
          {/* Main content */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6">Visual Trigger Assessment</h2>
              <p className="text-lg text-gray-300 mb-6">
                This interactive assessment helps understand organizational preferences and potential OCD tendencies by observing your reactions to different levels of visual disorder.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-500 mr-3 flex items-center justify-center">
                    <span className="text-sm">1</span>
                  </div>
                  <span>View table arrangements with increasing disorder</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-500 mr-3 flex items-center justify-center">
                    <span className="text-sm">2</span>
                  </div>
                  <span>Rate your comfort level with each arrangement</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-500 mr-3 flex items-center justify-center">
                    <span className="text-sm">3</span>
                  </div>
                  <span>Receive insights about your responses</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl p-6 border border-gray-700 shadow-2xl">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Assessment Preview</h3>
                  <div className="bg-gray-900 rounded-lg overflow-hidden h-48 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                    <div className="relative z-10 text-center">
                      {/* Simple table with items preview */}
                      <div className="w-16 h-12 bg-amber-700 rounded mx-auto mb-2"></div>
                      <div className="flex justify-center gap-4">
                        <div className="w-10 h-10 bg-blue-400 rounded-full transform rotate-12"></div>
                        <div className="w-12 h-8 bg-red-400 rounded transform -rotate-6"></div>
                        <div className="w-8 h-12 bg-green-400 rounded transform rotate-45"></div>
                      </div>
                      <p className="text-sm mt-4 text-gray-400">Observe and rate your comfort level</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <h4 className="font-medium mb-2 text-blue-400">Pro Tip</h4>
                  <motion.p 
                    key={currentTip}
                    className="text-sm text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {gameTips[currentTip]}
                  </motion.p>
                </div>

                <motion.button
                  onClick={startGame}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${isLoading ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}`}
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    'Start Assessment'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Features section */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <div className="w-14 h-14 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Visual Observation</h3>
                <p className="text-gray-400">Carefully observe each table arrangement with varying levels of disorder.</p>
              </div>

              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <div className="w-14 h-14 rounded-full bg-purple-500 bg-opacity-20 flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Rate Your Comfort</h3>
                <p className="text-gray-400">Honestly rate how each arrangement makes you feel on a comfort scale.</p>
              </div>

              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <div className="w-14 h-14 rounded-full bg-indigo-500 bg-opacity-20 flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Detailed Results</h3>
                <p className="text-gray-400">Receive a comprehensive analysis of your responses and potential tendencies.</p>
              </div>
            </div>
          </motion.div>

          {/* Levels preview */}
          <motion.div 
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl p-8 border border-gray-700 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Assessment Levels</h2>
            <div className="grid md:grid-cols-5 gap-4 text-center">
              {[1, 2, 3, 4, 5].map(level => (
                <div key={level} className="bg-gray-900 rounded-lg p-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 mx-auto mb-2 flex items-center justify-center">
                    <span className="font-bold">{level}</span>
                  </div>
                  <p className="text-sm text-gray-300">Level {level}</p>
                  <div className="mt-2 text-xs text-blue-400">
                    {level === 1 && "Neat"}
                    {level === 2 && "Slightly messy"}
                    {level === 3 && "Moderately messy"}
                    {level === 4 && "Very messy"}
                    {level === 5 && "Extremely messy"}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Note about assessment */}
          <motion.div 
            className="bg-blue-900 bg-opacity-20 backdrop-blur-md rounded-2xl p-6 border border-blue-700 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <h3 className="text-lg font-semibold mb-2 text-blue-300">Important Note</h3>
            <p className="text-gray-300">
              This assessment is for informational purposes only and is not a clinical diagnosis. 
              If you have concerns about OCD, please consult a mental health professional.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer 
        className="text-center py-8 text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <p>© {new Date().getFullYear()} OCD Assessment Tool. For educational purposes.</p>
      </motion.footer>
    </div>
  );
}