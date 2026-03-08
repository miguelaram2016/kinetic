# Kinetic Fitness App - API Documentation

## Overview
This API allows external tools and LLMs to access and modify Kinetic fitness data through RESTful endpoints.

## Base URL
```
http://localhost:3001/api
```

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

## Data Files
JSON data files are stored in `/src/data/`:
- `user.json` - User profile
- `exercises.json` - Exercise library
- `workouts.json` - Workout logs
- `programs.json` - Training programs
- `weight.json` - Weight logs
- `food.json` - Food/nutrition logs

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
