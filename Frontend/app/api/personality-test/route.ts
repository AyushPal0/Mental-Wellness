// app/api/personality-test/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json();

    // Here you would typically process the answers and generate a personality profile
    // Since your friend has already built this API, you would call their endpoint
    
    // For now, we'll return a mock response
    const mockResults = {
      profileType: "Mindful Explorer",
      wellnessFocus: "Focus & Calm",
      description: "You have a balanced approach to life, with a tendency toward introspection and careful consideration. Your mindfulness helps you navigate challenges with grace.",
      recommendations: [
        "Try the 4-7-8 breathing exercise when feeling overwhelmed",
        "Journal for 5 minutes each morning to clarify your thoughts",
        "Take short walking breaks to reset your focus during the day"
      ]
    };

    return NextResponse.json(mockResults);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process personality test' },
      { status: 500 }
    );
  }
}