# Kinetic Backend

Fitness tracking app backend API.

## Quick Start

```bash
# Install dependencies
cd backend
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with exercises
npm run db:seed

# Start dev server
npm run dev
```

The API runs on `http://localhost:3001`.

## Tech Stack

- **Express** - Web framework
- **Prisma** - ORM with SQLite
- **TypeScript** - Type safety

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Exercise seed data
│   └── dev.db           # SQLite database
├── src/
│   ├── index.ts         # Express server entry
│   ├── lib/
│   │   └── prisma.ts    # Prisma client
│   ├── routes/
│   │   ├── auth.ts      # /api/auth
│   │   ├── exercises.ts # /api/exercises
│   │   ├── workouts.ts  # /api/workouts
│   │   └── checkIns.ts  # /api/check-ins
│   └── services/        # Business logic
├── package.json
└── tsconfig.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register user (stub) |
| POST | `/api/auth/login` | Login user (stub) |
| GET | `/api/exercises` | List all exercises |
| GET | `/api/exercises/:id` | Get exercise by ID |
| GET | `/api/workouts/user/:userId` | Get user's workouts |
| POST | `/api/workouts` | Create workout |
| GET | `/api/check-ins/user/:userId` | Get user's check-ins |
| POST | `/api/check-ins` | Create check-in |

## Environment

- `PORT` - Server port (default: 3001)
- Database: SQLite at `prisma/dev.db`
