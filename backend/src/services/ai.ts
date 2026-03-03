import OpenAI from 'openai';

// Initialize OpenAI client (will use env var OPENAI_API_KEY)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface UserProfile {
  goals: string[];
  experienceLevel: string;
  equipment: string[];
  daysPerWeek: number;
  splitPreference: string;
  injuries: string[];
}

export interface DailyCheckIn {
  energy: number;
  sleep: number;
  stress: number;
  nutrition: string;
  soreness: number;
  notes?: string;
}

export interface GeneratedExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  weight?: number;
  rest: number;
  notes?: string;
}

export interface GeneratedWorkout {
  name: string;
  type: string;
  duration: number;
  exercises: GeneratedExercise[];
}

// System prompt for the AI coach
const SYSTEM_PROMPT = `You are Coach Kinetic, an AI personal training coach. You generate personalized workout programs based on user data.

You must respond with valid JSON only. No additional text.

Use this schema:
{
  "name": "Workout Name",
  "type": "strength|hypertrophy|full_body|upper|lower|push|pull|legs",
  "duration": 45,
  "exercises": [
    {
      "exerciseName": "Barbell Squat",
      "sets": 3,
      "reps": "8-12",
      "rest": 90,
      "notes": "Keep chest up, depth to parallel"
    }
  ]
}`;

export async function generateWorkout(
  profile: UserProfile,
  checkIn?: DailyCheckIn
): Promise<GeneratedWorkout> {
  // Build context from profile
  let context = `
User Profile:
- Goals: ${profile.goals.join(', ')}
- Experience: ${profile.experienceLevel}
- Equipment: ${profile.equipment.join(', ')}
- Training days: ${profile.daysPerWeek}/week
- Preferred split: ${profile.splitPreference}
- Injuries to work around: ${profile.injuries.join(', ') || 'none'}
`;

  if (checkIn) {
    context += `
Today's Check-in:
- Energy: ${checkIn.energy}/5
- Sleep: ${checkIn.sleep}/5
- Stress: ${checkIn.stress}/5
- Nutrition: ${checkIn.nutrition}
- Soreness: ${checkIn.soreness}/5
- Notes: ${checkIn.notes || 'none'}
`;
  }

  const prompt = `${SYSTEM_PROMPT}

${context}

Generate a workout appropriate for this user. Consider:
1. If energy is low (<=2), reduce volume and intensity
2. If soreness is high (>3), avoid direct work on sore muscles
3. Always substitute exercises the user doesn't have equipment for
4. Match the split to their available days per week

Respond with JSON only.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const workout = JSON.parse(content);
    
    // Map exercise names to IDs (we'll do this in the route)
    return workout;
  } catch (error) {
    console.error('AI workout generation error:', error);
    throw new Error('Failed to generate workout');
  }
}

export async function processFeedback(
  workoutId: string,
  feedback: {
    difficulty: number;
    energy: number;
    completed: boolean;
    notes?: string;
  }
): Promise<{
  adjustments: 'easier' | 'harder' | 'same';
  reasoning: string;
}> {
  const prompt = `
The user just completed a workout and provided feedback:
- Difficulty: ${feedback.difficulty}/5
- Energy during workout: ${feedback.energy}/5
- Completed: ${feedback.completed}
- Notes: ${feedback.notes || 'none'}

Determine if the next workout should be:
- "easier" - reduce weight by 10-15%, reduce sets
- "harder" - increase weight by 5-10%, add intensity
- "same" - maintain current level

Respond with JSON:
{
  "adjustments": "easier|harder|same",
  "reasoning": "brief explanation"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { adjustments: 'same', reasoning: 'Could not process feedback' };
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('AI feedback processing error:', error);
    return { adjustments: 'same', reasoning: 'Error processing feedback' };
  }
}

export async function chatWithCoach(
  userMessage: string,
  context: {
    profile?: UserProfile;
    recentWorkouts?: any[];
    checkIn?: DailyCheckIn;
  }
): Promise<string> {
  const contextStr = JSON.stringify(context, null, 2);

  const prompt = `
You are Coach Kinetic, an AI personal training coach.

User says: ${userMessage}

Context (recent workouts, profile, etc.):
${contextStr}

Respond as a helpful fitness coach. Keep it conversational and concise. If they want a workout, ask for their check-in first.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are Coach Kinetic, a helpful AI fitness coach.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || 'I could not process that. Try again.';
  } catch (error) {
    console.error('AI chat error:', error);
    return 'Sorry, I had trouble processing that. Try again.';
  }
}
