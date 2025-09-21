import { FloatingDock } from "@/components/ui/floating-dock";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar"; // Import the new Navbar

export function EunoiaLanding() {
  return (
    <div className="relative z-10 flex h-full w-full flex-col px-4">
      {/* Use the new Navbar component instead of the centered FloatingDock */}
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-6xl mx-auto py-8">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 text-balance">Eunoia</h1>
          <p className="text-lg md:text-xl text-white/80 mb-2 font-light">Youth Mental Wellness AI</p>
          <p className="text-base text-white/60 max-w-xl mx-auto text-pretty">
            A responsible, confidential, and empathetic AI companion designed to support youth mental wellness through
            personalized conversations, wellness games, and community connection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="bg-white text-black hover:bg-white/90 font-medium px-8 py-3">
            Start Your Journey
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="border-white text-white hover:bg-white hover:text-black font-medium px-8 py-3 bg-transparent"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
}