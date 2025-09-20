'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function GameIntroPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  const gameTips = [
    "Drag items to move them around the table",
    "Use your mouse wheel to rotate items",
    "Try to arrange items neatly and symmetrically",
    "Complete the level when you're satisfied with your arrangement",
    "Your precision and speed affect your final score"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
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
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            EUNOIA
          </h1>
          <p className="text-xl text-gray-300">Mental Wellness Assessment</p>
        </motion.header>

        <div className="max-w-4xl mx-auto">
          {/* Main content */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6">Table Arrangement Challenge</h2>
              <p className="text-lg text-gray-300 mb-6">
                This interactive assessment helps understand organizational preferences and attention to detail through a simple table arrangement task.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 mr-3 flex items-center justify-center">
                    <span className="text-sm">1</span>
                  </div>
                  <span>Arrange items on the virtual table</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 mr-3 flex items-center justify-center">
                    <span className="text-sm">2</span>
                  </div>
                  <span>Test your precision and speed</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 mr-3 flex items-center justify-center">
                    <span className="text-sm">3</span>
                  </div>
                  <span>Receive insights about your approach</span>
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
                  <h3 className="text-xl font-semibold mb-4">Game Preview</h3>
                  <div className="bg-gray-900 rounded-lg overflow-hidden h-48 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-16 h-16 bg-cyan-500 rounded-lg mx-auto transform rotate-12 mb-2"></div>
                      <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto -mt-8 ml-12 transform -rotate-6"></div>
                      <p className="text-sm mt-4 text-gray-400">Drag and rotate items</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <h4 className="font-medium mb-2 text-cyan-400">Pro Tip</h4>
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
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${isLoading ? 'bg-gray-700' : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'}`}
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
                <div className="w-14 h-14 rounded-full bg-cyan-500 bg-opacity-20 flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Multiple Levels</h3>
                <p className="text-gray-400">Progress through increasingly complex arrangement challenges.</p>
              </div>

              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <div className="w-14 h-14 rounded-full bg-purple-500 bg-opacity-20 flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Detailed Analysis</h3>
                <p className="text-gray-400">Receive comprehensive feedback on your performance and approach.</p>
              </div>

              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <div className="w-14 h-14 rounded-full bg-indigo-500 bg-opacity-20 flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
                <p className="text-gray-400">Monitor your improvement over time with detailed metrics.</p>
              </div>
            </div>
          </motion.div>

          {/* System requirements */}
          <motion.div 
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl p-8 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">PC System Recommendations</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-cyan-400">Minimum Requirements</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3"></div>
                    <span>Modern web browser (Chrome, Firefox, Edge)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3"></div>
                    <span>Mouse with scroll wheel</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3"></div>
                    <span>Screen resolution: 1280x720 or higher</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-400">Recommended</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                    <span>Chrome or Firefox for best performance</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                    <span>Standard mouse for precise control</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                    <span>1920x1080 resolution for optimal experience</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer 
        className="text-center py-8 text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <p>© {new Date().getFullYear()} EUNOIA Mental Wellness Platform. Designed for PC.</p>
      </motion.footer>
    </div>
  );
}