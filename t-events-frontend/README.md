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

## Docker

Backend must be available before starting the frontend container.

Default backend address for Docker is `http://host.docker.internal:8080`.
It works in Docker Desktop on Windows and macOS. On Linux, the compose file
adds `host.docker.internal` through `host-gateway`.

```bash
docker compose up --build
```

To use another backend address:

```bash
BACKEND_API_ORIGIN=http://localhost:8080 docker compose up --build
```

PowerShell:

```powershell
$env:BACKEND_API_ORIGIN="http://localhost:8080"
docker compose up --build
```

## Quality checks

```bash
npm run lint
npm run test
npm run build
```

## Environment variables

- `BACKEND_API_ORIGIN` — backend base origin used by Next.js rewrites (default: `http://localhost:8080`).

## Sprint 2.2 API integration

Frontend integrates Sprint 2.2 participant flow endpoints:

- `GET /api/v1/events/{event_id}/directions/{direction_id}/games`
- `POST /api/v1/events/{event_id}/directions/{direction_id}/games/{event_game_id}/sessions`
- `GET /api/v1/events/{event_id}/directions/{direction_id}/games/{event_game_id}/sessions/{session_id}`
- `POST /api/v1/events/{event_id}/directions/{direction_id}/games/{event_game_id}/sessions/{session_id}/answers`

Implemented UI flows:

- events list/details against the new `status` field
- games list for selected direction with direction-level progress summary and reward thresholds
- start/continue session from game card (backend decides create vs resume)
- session state loading and refresh for restore/continue behavior
- answer submission for both engines:
  - `question_answer` with `text_answer`
  - `quiz` with `option_id`
- direction-level summary updates after each answer
- centralized mapping of Sprint 2 / 2.2 API error codes to user-friendly messages
