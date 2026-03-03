# Kinetic — Project Specification

> AI-Powered Personal Training Coach

---

## 1. Overview

**Kinetic** is an AI-powered personal training app that provides adaptive, conversational coaching for lifters who need structure and help navigating the stimulus-adaptation curve.

Unlike form-heavy fitness apps, Kinetic talks to users naturally — adjusting workouts based on daily readiness, feedback, and recovery signals.

---

## 2. Target Audience

- **General fitness** — people starting or returning to lifting
- **Bodybuilders** — hypertrophic focus, volume management
- **Weightlifters / Powerlifters** — strength progression, peaking
- **Anyone needing structure** — who struggles with programming and progression

**Core problem:** Users know they should lift, but don't know what, how much, or when to progress. The stimulus-adaptation curve is hard to ride alone.

---

## 3. Core Differentiator

**Natural language + adaptive coaching** — the app is a conversational AI trainer, not a form-based workout generator.

- Chat with your coach ("I'm feeling tired today")
- Daily readiness check-ins (sleep, nutrition, stress)
- Adaptive intensity based on life factors
- Two-stage generation: natural language → structured workout

---

## 4. MVP Scope

### Phase 1: Website (MVP)

| Feature | Priority |
|---------|----------|
| User auth (email + OAuth) | P0 |
| Onboarding (goals, biometrics, equipment) | P0 |
| Daily check-in flow | P0 |
| AI workout generation (two-stage) | P0 |
| Workout logging | P0 |
| Progress tracking (weights, PRs) | P0 |
| Basic analytics | P1 |
| User-modifiable AI persona | P1 |

### Phase 2: Mobile Apps

| Feature | Priority |
|---------|----------|
| React Native iOS app | P0 |
| React Native Android app | P0 |
| Apple Watch / WearOS companion | P1 |

### Phase 3: Expansion

| Feature | Priority |
|---------|----------|
| Nutrition tracking | P2 |
| Human coach marketplace | P2 |
| Social / community | P2 |

---

## 5. AI System Architecture

### 5.1 Persona System

**Default Persona:** "Supportive Coach"

- Encouraging, knowledgeable
- Evidence-based programming
- Adjusts based on user feedback
- User can modify: name, tone (supportive → drill sergeant), communication style

**Persona Parameters:**
- `name`: string
- `tone`: "supportive" | "neutral" | "intense"
- `verbosity`: "brief" | "moderate" | "detailed"
- `focus`: "strength" | "hypertrophy" | "general fitness"

### 5.2 Two-Stage Generation

```
Stage 1: LLM generates natural language workout
    ↓
Stage 2: LLM structures into JSON (exercises, sets, reps, weights)
    ↓
Stage 3: Safety layer validates against user constraints
    ↓
Stage 4: Return to user
```

### 5.3 Adaptive Feedback System

**Daily Check-In Inputs:**

| Input | Options |
|-------|---------|
| Energy | 1-5 scale |
| Sleep quality | 1-5 scale |
| Stress level | 1-5 scale |
| Nutrition | "on point" / "struggling" / "mid" |
| Soreness | 1-5 scale |
| Notes | free text |

**Feedback Response Mapping:**

| User Input | AI Adjustment |
|------------|---------------|
| Low energy / poor sleep | Reduce volume 10-20%, add deload elements |
| High stress | Lower intensity, focus on recovery |
| Good nutrition / great sleep | Push harder, increase progressive overload |
| Soreness > 4 | Active recovery, reduce strain on sore muscles |
| "Too hard" | Reduce weight 10-15%, increase rest |
| "Too easy" | Increase weight 5-10%, add intensity techniques |
| "Don't have equipment" | Substitute bodyweight / dumbbell alternatives |

### 5.4 Safety Guardrails

- **Medical disclaimer** on onboarding and periodic reminders
- **Red flag detection** — flag for professional consult if: persistent joint pain, extreme fatigue, eating disorder signals
- **Conservative programming** — AI defaults to safer progressions
- **Injury handling** — never prescribe around pain; substitute movements
- **Age considerations** — emphasize recovery for 50+

---

## 6. Technical Architecture

### 6.1 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend (Web)** | Next.js 14 (App Router), TypeScript, Tailwind |
| **Frontend (Mobile)** | React Native (Expo) |
| **Backend** | Node.js + Express or Next.js API routes |
| **Database** | PostgreSQL (Supabase or self-hosted) |
| **Auth** | Supabase Auth or Clerk |
| **AI** | OpenAI API (GPT-4o) + Claude for complex reasoning |
| **Storage** | Supabase Storage or AWS S3 |
| **Push Notifications** | Expo Notifications |
| **Wearable Sync** | Apple HealthKit, Google Fit API |

### 6.2 Database Schema

**Core Tables:**

```
users
user_profiles (biometrics, goals, BMR/TDEE)
exercises (master library)
exercise_muscle_groups
exercise_equipment
workouts (generated workouts)
workout_exercises (bridge)
workout_logs (completed sessions)
workout_set_logs (individual sets)
personal_records (cached PRs)
body_measurements
check_ins (daily readiness)
ai_personas (user-modified)
conversation_history
```

### 6.3 API Structure

```
/api/auth/*          - Authentication
/api/users/*         - User management
/api/profile/*       - Biometrics, goals
/api/exercises/*     - Exercise library
/api/workouts/*      - Generate, fetch, log workouts
/api/progress/*      - PRs, measurements, analytics
/api/ai/chat        - Conversational coach
/api/ai/generate    - Workout generation
/api/ai/check-in    - Daily readiness
/api/wearables/*    - Apple Health / Fit sync
```

### 6.4 Security

- All API routes authenticated
- Rate limiting on AI endpoints
- Input sanitization on all user inputs
- AI output validation layer before serving
- HTTPS everywhere
- JWT + refresh tokens

---

## 7. User Flow

### 7.1 Onboarding

1. **Sign up** — email or OAuth (Google, Apple)
2. **Profile setup** — name, goals, experience level
3. **Biometrics** — weight, height, age, gender
4. **Equipment** — what's available at gym / home
5. **Training history** — what have you done before?
6. **Injuries** — what to avoid
7. **Goals** — strength, muscle, weight loss, general fitness
8. **First workout** — AI generates based on all above

### 7.2 Daily Flow

1. **Morning check-in** (optional but encouraged)
   - How'd you sleep?
   - How's your energy?
   - Stress level?
   - Nutrition on point?
2. **AI recommends** workout or rest day based on check-in
3. **User confirms** or asks for alternative
4. **Workout mode** — guided session with logging
5. **Post-workout** — rate difficulty, any notes
6. **Progress updates** — PRs highlighted, trends

### 7.3 Conversation Mode

User can chat anytime:
- "Should I skip today?"
- "My shoulder hurts, what should I do?"
- "What's my progress on bench press?"
- "Make today's workout harder"

---

## 8. Pricing Model (Future)

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Basic workout generation, limited history |
| **Pro** | $9.99/mo | Unlimited AI coaching, full analytics, custom personas |
| **Trainer** | $29.99/mo | Human coach integration, custom programs |

---

## 9. Roadmap

### Month 1: Foundation
- [ ] Project setup (repo, CI/CD)
- [ ] Auth system
- [ ] Database schema
- [ ] Exercise library (seed data)
- [ ] Basic onboarding flow

### Month 2: Core AI
- [ ] AI persona system
- [ ] Two-stage workout generation
- [ ] Daily check-in flow
- [ ] Workout logging
- [ ] Progress tracking

### Month 3: Polish
- [ ] Web app UI/UX
- [ ] Adaptive feedback loop
- [ ] Analytics dashboard
- [ ] User persona customization
- [ ] Beta launch

### Month 4+: Mobile
- [ ] React Native app
- [ ] Watch companion app
- [ ] Wearable integrations
- [ ] Push notifications

---

## 10. Key Files

- `SPEC.md` — this file
- `docs/architecture/` — detailed system docs
- `docs/ai-prompts/` — persona and prompt engineering
- `docs/database/` — schema reference

---

## 11. Notes

- Nutrition tracking is **out of scope** for MVP — can be added later
- Initial focus on **weightlifting** — cardio can be added
- Wearable sync is nice-to-have but **not required** for MVP
- Website first validates concept before investing in native apps

---

*Last updated: 2026-03-02*
