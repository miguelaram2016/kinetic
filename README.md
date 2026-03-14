# Kinetic - AI Personal Training App

> AI-powered fitness coaching with natural language

## Overview

Kinetic is an AI personal training app that provides adaptive, conversational coaching for lifters. Users can chat naturally with their AI coach instead of filling out forms.

## Tech Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Express + Prisma + MongoDB
- **AI:** OpenAI API (GPT-4o)
- **Auth:** Simple user system (no email required for demo)

## Key Features

- Natural language AI coaching
- Adaptive workouts based on daily check-ins
- Custom exercise library with media (images, videos)
- User dashboards with progress tracking
- Workout logging and PR tracking

## Project Structure

```
kinetic/
├── SPEC.md                 # Full project specification
├── docs/
│   ├── onboarding-flow.md  # 14-step user onboarding

## Icons

This project uses [better-icons](https://github.com/better-auth/better-icons) for AI-powered icon search.

### Using with Codex

The project has an MCP config at `mcp.json` — Codex can search and add icons using natural language:

- `"Search for fitness icons"`
- `"Get lucide:dumbbell as SVG"`
- `"Add a workout icon to my dashboard"`
│   ├── exercise-library.md # 75+ exercises database
│   └── ai-prompts.md      # AI coaching prompts
├── src/                    # Next.js frontend
│   ├── app/
│   │   ├── page.tsx       # Landing page
│   │   ├── demo/          # Demo with sample workout
│   │   ├── dashboard/      # User dashboard
│   │   ├── workouts/      # Workout creation
│   │   └── exercises/     # Exercise creation
│   └── lib/
│       └── api.ts        # API client
└── backend/
    └── src/
        ├── routes/        # API endpoints
        ├── services/     # Business logic
        └── prisma/       # Database schema
```

## Running Locally

```bash
# Frontend
cd kinetic && npm run dev  # http://localhost:3000

# Backend  
cd kinetic/backend && npm run dev  # http://localhost:3001
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET/POST /api/users` | User management |
| `GET /api/users/:id/dashboard` | Dashboard data |
| `GET/POST /api/exercises` | Exercise library |
| `GET/POST /api/workouts` | Workout CRUD |
| `POST /api/ai/generate-workout` | AI workout generation |
| `POST /api/ai/chat` | Chat with AI coach |

## Research & Competitor Analysis

See `docs/` for detailed research:

- **Competitor Analysis:** Trainerize, FitnessAI, Zing Coach, Humango, Strong, JEFIT
- **AI Prompt Engineering:** Two-stage generation, persona system, safety guardrails
- **Dashboard UX:** Best practices from top fitness apps

## Contributing

1. Clone the repo
2. Create a branch
3. Make changes
4. Submit PR

## License

MIT
