"use client"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"

export default function InfiniteMovingCardsDemo() {
  return (
    <div className="h-[40rem] rounded-md flex flex-col antialiased bg-transparent items-center justify-center relative overflow-hidden">
      <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
    </div>
  )
}

const testimonials = [
  {
    quote:
      "Eunoia helped me understand my emotions better. The AI conversations feel so natural and supportive, like talking to a friend who really gets it.",
    name: "Alex M.",
    title: "Age 17",
  },
  {
    quote:
      "The wellness games are actually fun! I never thought tracking my mood could be engaging. It's helped me notice patterns I never saw before.",
    name: "Jordan K.",
    title: "Age 16",
  },
  {
    quote:
      "Finding a safe space to share my thoughts anonymously has been life-changing. The community here truly understands what I'm going through.",
    name: "Sam R.",
    title: "Age 18",
  },
  {
    quote:
      "The daily check-ins and coping strategies have become part of my routine. Eunoia makes mental wellness feel achievable, not overwhelming.",
    name: "Casey L.",
    title: "Age 15",
  },
  {
    quote:
      "I was skeptical about AI therapy, but Eunoia's approach is different. It's not trying to replace real help, just be there when I need support.",
    name: "Riley P.",
    title: "Age 17",
  },
]
