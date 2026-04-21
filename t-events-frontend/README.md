# T-Events Frontend

## Setup

```bash
cd /home/runner/work/frontend/frontend/t-events-frontend
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
