# T-Events Frontend

## Setup

```bash
cd t-events-frontend
cp .env.example .env.local
npm ci
```

## Development

```bash
npm run dev
```

## Quality checks

```bash
npm run lint
npm run test
npm run build
```

## Environment variables

- `BACKEND_API_ORIGIN` — backend base origin used by Next.js rewrites (default: `http://localhost:8080`).

## Sprint 2 API integration

Frontend integrates Sprint 2 game flow endpoints:

- `GET /api/v1/events/{event_id}/directions/{direction_id}/games`
- `POST /api/v1/events/{event_id}/directions/{direction_id}/games/{event_game_id}/sessions`
- `GET /api/v1/events/{event_id}/directions/{direction_id}/games/{event_game_id}/sessions/{session_id}`
- `POST /api/v1/events/{event_id}/directions/{direction_id}/games/{event_game_id}/sessions/{session_id}/answers`

Implemented UI flows:

- games list for selected direction with progress summary and reward thresholds
- start/continue session from game card (backend decides create vs resume)
- session state loading and refresh for restore/continue behavior
- answer submission for both engines:
  - `question_answer` with `text_answer`
  - `quiz` with `option_id`
- centralized mapping of Sprint 2 API error codes to user-friendly messages
