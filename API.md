# Kinetic Fitness App - API Documentation

## ⚠️ Architecture Note

Kinetic uses **two data layers**:

1. **Client-side (default)**: All UI interactions use `localStorage` for persistence. This is the primary data layer and works offline.
2. **API (external tools only)**: REST endpoints for external tools/LLMs to access data. **Requires a persistent backend** — the API routes use file system (`fs.writeFileSync`) which does NOT work on Vercel/serverless.

For local development, you can run a separate API server. For production with external access, you'll need a real database (PostgreSQL, MongoDB, etc.).

---

## Overview
This API allows external tools and LLMs to access and modify Kinetic fitness data through RESTful endpoints.

## Base URL
```
http://localhost:3001/api
```

> **Note**: The API runs on a separate port (3001) from the main Next.js app. Run `node backend/server.js` to start the API server.

## Authentication
All endpoints require an API key passed via the `X-API-Key` header:
```
X-API-Key: kinetic-dev-key
```

You can set a custom API key in `.env.local`:
```
KINETIC_API_KEY=your-secret-key
```

## Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get user profile |
| POST | `/api/users` | Update user profile |

### Workouts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workouts` | List all workouts |
| GET | `/api/workouts?userId=X` | Filter by user |
| GET | `/api/workouts?status=planned` | Filter by status |
| POST | `/api/workouts` | Create new workout |

### Exercises
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exercises` | List all exercises |
| GET | `/api/exercises?muscleGroup=chest` | Filter by muscle group |
| GET | `/api/exercises?search=bench` | Search exercises |
| POST | `/api/exercises` | Add new exercise |

### Programs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/programs` | List all programs |
| GET | `/api/programs?active=true` | Filter active programs |
| POST | `/api/programs` | Create new program |

### Weight
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weight` | List weight entries |
| GET | `/api/weight?startDate=2024-01-01&endDate=2024-03-01` | Filter by date range |
| POST | `/api/weight` | Add weight entry |

### Food
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/food` | List food entries |
| GET | `/api/food?date=2024-03-06` | Filter by date |
| POST | `/api/food` | Add food entry |

### AI Commands
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/command` | Get user context for AI |
| POST | `/api/ai/command` | Execute natural language command |

#### Example AI Commands
```json
{
  "command": "what is today's workout"
}
```
```json
{
  "command": "log weight 180 lbs"
}
```
```json
{
  "command": "add bench press to today's workout"
}
```

## Data Storage

### LocalStorage (Primary - Client)
The main app stores data in browser localStorage:
- `kinetic_workouts` - Workout logs
- `kinetic_programs` - Training programs
- `kinetic_weight` - Weight entries
- `kinetic_food` - Food/nutrition logs
- `kinetic_exercise_favorites` - Favorite exercises

### JSON Files (API Backend)
The API server reads/writes JSON files in `/src/data/`:
- `user.json` - User profile
- `exercises.json` - Exercise library
- `workouts.json` - Workout logs
- `programs.json` - Training programs
- `weight.json` - Weight logs
- `food.json` - Food/nutrition logs

## Running the API Server

```bash
# Install dependencies
npm install

# Start the Next.js app (includes API routes for local dev)
npm run dev

# For external API access, run separate server (requires persistent filesystem)
node backend/server.js
```

---

## Example Usage

### cURL
```bash
# Get user profile
curl -H "X-API-Key: kinetic-dev-key" http://localhost:3001/api/users

# Get today's workout
curl -H "X-API-Key: kinetic-dev-key" http://localhost:3001/api/workouts?date=2024-03-06

# Add weight entry
curl -X POST -H "X-API-Key: kinetic-dev-key" -H "Content-Type: application/json" \
  -d '{"date":"2024-03-07","weight":180}' \
  http://localhost:3001/api/weight
```

### JavaScript
```javascript
const API_KEY = 'kinetic-dev-key';
const BASE_URL = 'http://localhost:3001/api';

async function getUser() {
  const res = await fetch(`${BASE_URL}/users`, {
    headers: { 'X-API-Key': API_KEY }
  });
  return res.json();
}

async function addWorkout(workout) {
  const res = await fetch(`${BASE_URL}/workouts`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(workout)
  });
  return res.json();
}
```
