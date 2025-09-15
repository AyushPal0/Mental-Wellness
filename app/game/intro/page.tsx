import Link from 'next/link';

export default function GameIntroPage() {
  return (
    <div className="container mx-auto p-4 max-w-md flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Pattern Calm</h1>
      <p className="text-center mb-4">
        Complete the patterns while resisting the urge to make them perfect.
        This helps us understand your focus patterns.
      </p>
      <ul className="list-disc list-inside mb-6 text-sm italic">
        <li>Tap the correct shape to complete each pattern</li>
        <li>Work at a comfortable pace</li>
        <li>It's okay to make mistakes</li>
        <li>Takes about 3 minutes</li>
      </ul>
      <Link 
        href="/game/play" 
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Start Game
      </Link>
    </div>
  );
}