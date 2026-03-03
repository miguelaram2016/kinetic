# Kinetic Onboarding Flow

## Overview
Multi-step onboarding flow to collect user data for personalized workout generation.

---

## Step 1: Welcome
**Screen:** Landing / Welcome

- Hero: "Your AI Personal Trainer"
- Subtitle: "Adaptive workouts that adjust to your life"
- CTA: "Get Started"
- Social proof: "Join X+ lifters"

---

## Step 2: Sign Up
**Screen:** Authentication

- Email + Password
- OAuth: Google, Apple
- Already have account? Sign in

---

## Step 3: Goals
**Screen:** "What are you training for?"

Options (multi-select):
- 🏋️ Build Muscle (Hypertrophy)
- 💪 Gain Strength
- 🔥 Fat Loss
- 🏃 General Fitness
- ⚡ Improve Endurance

---

## Step 4: Experience
**Screen:** "What's your fitness level?"

Options:
- 🥉 Beginner (0-1 years)
- 🥈 Intermediate (1-3 years)
- 🥇 Advanced (3+ years)

---

## Step 5: Biometrics
**Screen:** "Tell us about yourself"

Fields:
- Age (number input)
- Gender (Male / Female / Non-binary / Prefer not to say)
- Height (ft/in or cm toggle)
- Weight (lbs or kg toggle)
- Optional: Body fat %

---

## Step 6: Body Composition Goals
**Screen:** "What's your body composition goal?"

Options:
- Maintain current weight
- Bulk (gain weight)
- Cut (lose weight)
- Recomposition (gain muscle, lose fat)

---

## Step 7: Equipment
**Screen:** "What equipment do you have access to?"

Options (multi-select):
- 🏋️ Full Gym (all equipment)
- 🏠 Home Gym (some basics)
- 📦 Dumbbells Only
- 🖐️ Bodyweight Only (no equipment)
- Specific equipment checkboxes:
  - Barbell + Plates
  - Dumbbells
  - Kettlebells
  - Pull-up bar
  - Resistance bands
  - Bench (flat/incline)
  - Cable machine
  - Machines

---

## Step 8: Schedule
**Screen:** "How often can you train?"

Options:
- 2 days/week
- 3 days/week
- 4 days/week
- 5 days/week
- 6 days/week

---

## Step 9: Training Split Preference
**Screen:** "What type of training do you prefer?"

Options:
- Full Body (2-3 days)
- Upper / Lower (4 days)
- Push / Pull / Legs (6 days)
- Body Part Split
- I don't know, you decide

---

## Step 10: Injuries / Limitations
**Screen:** "Any injuries or limitations?"

Fields:
- List of common injuries (multi-select):
  - Shoulder impingement
  - Lower back pain
  - Knee issues
  - Wrist pain
  - Elbow tendinitis
  - Neck issues
  - Hip flexor tightness
  - None
- Free text: "Any other injuries or conditions we should know about?"

---

## Step 11: Dietary Habits (Optional)
**Screen:** "How's your nutrition?"

Options:
- On point (tracking macros/calories)
- Mostly good (mindful eating)
- Struggling (inconsistent)
- Not tracking yet

---

## Step 12: AI Persona
**Screen:** "Choose your coach style"

Options:
- 😊 Supportive (Encouraging, patient)
- 🎯 Focused (Direct, results-oriented)
- 🔥 Intense (High accountability)
- 🤖 Custom (name, tone, verbosity)

If Custom selected:
- Coach Name (text input)
- Tone slider: Motivating ←→ Direct
- Verbosity: Brief ←→ Detailed

---

## Step 13: First Workout Generation
**Screen:** "Generating your first workout..."

- Show progress
- Generate workout based on all data collected

---

## Step 14: Success / Dashboard
**Screen:** "Your first workout is ready!"

- Preview workout
- Options:
  - "Start Workout" → Go to workout mode
  - "Review Profile" → Edit settings
  - "I'll do it later" → Save to queue

---

## Technical Notes

### Data Model (from onboarding)

```typescript
interface OnboardingData {
  // Step 3-4
  goals: ('muscle' | 'strength' | 'fat_loss' | 'fitness' | 'endurance')[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  
  // Step 5-6
  biometrics: {
    age: number;
    gender: string;
    height: number; // cm
    weight: number; // kg
    bodyFatPercent?: number;
  };
  bodyCompositionGoal: 'maintain' | 'bulk' | 'cut' | 'recomp';
  
  // Step 7
  equipment: string[]; // e.g., ['barbell', 'dumbbells', 'bench']
  hasFullGym: boolean;
  
  // Step 8-9
  daysPerWeek: number;
  splitPreference: 'full_body' | 'upper_lower' | 'ppl' | 'body_part' | 'surprise_me';
  
  // Step 10
  injuries: string[];
  injuriesOther?: string;
  
  // Step 11 (optional)
  dietaryHabits?: 'tracking' | 'mindful' | 'struggling' | 'not_tracking';
  
  // Step 12
  aiPersona: {
    type: 'supportive' | 'focused' | 'intense' | 'custom';
    name?: string;
    tone?: number; // 1-5
    verbosity?: number; // 1-5
  };
}
```

### Navigation

- Progress bar at top
- Back button on each step
- Skip button where applicable (marked optional)
- Can save progress and continue later

### Validation

- Required fields marked with *
- Age: 13-100
- Weight/Height: reasonable ranges
- Email validation
- Password: min 8 chars

---

## Daily Check-In Flow (Post-Onboarding)

After first workout, morning check-in prompt:

```
Good morning! How are you feeling today?

- Energy: 1-5 ⚡
- Sleep: 1-5 😴
- Stress: 1-5 😰
- Nutrition: On point / Mid / Struggling 🍎
- Soreness: 1-5 💪
- Notes (optional): [text]

→ Generate Workout / Rest Day / Active Recovery
```
