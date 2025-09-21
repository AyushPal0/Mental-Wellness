// lib/api.ts
export async function submitPersonalityTest(answers: Answer[]): Promise<PersonalityResult> {
  const response = await fetch('/api/personality-test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit personality test');
  }

  return response.json();
}