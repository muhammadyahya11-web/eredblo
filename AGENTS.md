# AGENTS.md

## Commands

### Client (`client/`)
- Build: `npm run build` (vite build)
- Lint: `npm run lint` (oxlint)
- Test: `npm test` (vitest run)

### Server (`server/`)
- Start dev: `npm run dev` (nodemon server.js)
- Start prod: `npm start`
- Test: `npm test` (jest --runInBank, NODE_ENV=test, in-memory MongoDB)

## Notes
- Server listens on port 5000 (override via `PORT` env var).
- Daily-profit cron runs via Vercel Cron Job (`/api/cron/daily-profit`) on serverless; local scheduler runs every hour when not serverless.
