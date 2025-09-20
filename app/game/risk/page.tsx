'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

// Mock therapist data - in a real app, you'd fetch this from an API
const THERAPISTS = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "OCD and Anxiety Disorders",
    location: "Downtown Clinic",
    address: "123 Wellness St, City Center",
    phone: "(555) 123-4567",
    distance: "0.8 miles away",
    rating: 4.8,
    image: "/api/placeholder/80/80"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Cognitive Behavioral Therapy",
    location: "Mindful Health Center",
    address: "456 Harmony Ave, City Center",
    phone: "(555) 987-6543",
    distance: "1.2 miles away",
    rating: 4.9,
    image: "/api/placeholder/80/80"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Exposure and Response Prevention",
    location: "Peaceful Mind Institute",
    address: "789 Serenity Blvd, City Center",
    phone: "(555) 456-7890",
    distance: "2.1 miles away",
    rating: 4.7,
    image: "/api/placeholder/80/80"
  }
];

const CRISIS_RESOURCES = [
  {
    name: "Crisis Text Line",
    contact: "Text HOME to 741741",
    description: "Free, 24/7 support for those in crisis"
  },
  {
    name: "National Suicide Prevention Lifeline",
    contact: "Call 988",
    description: "24/7 free and confidential support"
  },
  {
    name: "International OCD Foundation",
    contact: "www.iocdf.org",
    description: "Resources and treatment provider database"
  }
];

export default function RiskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const score = searchParams.get('score');
  const [userLocation, setUserLocation] = useState('City Center');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    // In a real app, you would get the user's location here
    // For now, we'll use a timeout to simulate loading
    const timer = setTimeout(() => {
      setIsLoadingLocation(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getSeverityLevel = (score: number) => {
    if (score >= 80) return "Severe";
    if (score >= 60) return "Significant";
    if (score >= 40) return "Moderate";
    if (score >= 20) return "Mild";
    return "None";
  };

  const handleRetakeAssessment = () => {
    router.push('/game/play');
  };

  const handleMainMenu = () => {
    router.push('/game/intro');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
            Important Notice Regarding Your Results
          </h1>
          <p className="text-lg text-gray-300">
            Based on your assessment score of <span className="font-bold text-red-400">{score}/100</span>, 
            we recommend consulting with a mental health professional.
          </p>
        </motion.div>

        {/* Severity Explanation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-red-900 bg-opacity-30 rounded-2xl p-6 mb-8 border border-red-700"
        >
          <div className="flex items-start">
            <div className="mr-4 text-red-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Your assessment indicates {getSeverityLevel(Number(score))} severity</h2>
              <p className="text-gray-300">
                While this assessment is not a diagnostic tool, your responses suggest that speaking with a mental health professional could be beneficial. 
                The therapists below specialize in OCD and related anxiety disorders.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Location Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-4">Therapists Near You</h2>
          {isLoadingLocation ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="ml-3">Finding therapists in your area...</span>
            </div>
          ) : (
            <>
              <p className="text-gray-400 mb-6">Showing results for <span className="text-blue-400">{userLocation}</span></p>
              
              <div className="space-y-6">
                {THERAPISTS.map((therapist, index) => (
                  <motion.div 
                    key={therapist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="bg-gray-700 rounded-xl p-4 flex items-start"
                  >
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">{therapist.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold">{therapist.name}</h3>
                      <p className="text-blue-300">{therapist.specialty}</p>
                      <p className="text-gray-400 mt-1">{therapist.location}</p>
                      <p className="text-gray-400 text-sm">{therapist.address}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-yellow-400 mr-2">★</span>
                        <span className="text-gray-300">{therapist.rating}</span>
                        <span className="text-gray-500 mx-2">•</span>
                        <span className="text-green-400">{therapist.distance}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <a 
                        href={`tel:${therapist.phone}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Call Now
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Crisis Resources */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-blue-900 bg-opacity-30 rounded-2xl p-6 mb-8 border border-blue-700"
        >
          <h2 className="text-2xl font-bold mb-4">Immediate Support Resources</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {CRISIS_RESOURCES.map((resource, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="bg-blue-800 bg-opacity-50 rounded-xl p-4 text-center"
              >
                <h3 className="font-semibold mb-2">{resource.name}</h3>
                <p className="text-blue-300 font-medium mb-1">{resource.contact}</p>
                <p className="text-sm text-gray-300">{resource.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-300">
            <li>Contact one of the therapists listed above to schedule an appointment</li>
            <li>Consider reaching out to your primary care physician for a referral</li>
            <li>Check with your insurance provider about mental health coverage</li>
            <li>Remember that seeking help is a sign of strength, not weakness</li>
          </ol>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button 
            onClick={handleRetakeAssessment}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-all duration-300"
          >
            Retake Assessment
          </button>
          <button 
            onClick={handleMainMenu}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300"
          >
            Return to Main Menu
          </button>
        </motion.div>

        {/* Disclaimer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          <p>This information is provided for educational purposes only and is not a substitute for professional medical advice.</p>
        </motion.div>
      </div>
    </div>
  );
}