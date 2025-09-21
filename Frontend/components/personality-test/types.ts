// components/personality-test/types.ts
export interface Question {
  id: number;
  text: string;
  dimension: string;
}

export interface Answer {
  questionId: number;
  value: number;
}

export interface PersonalityResult {
  profileType: string;
  wellnessFocus: string;
  description: string;
}