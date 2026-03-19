# Sereya Law Firm

A case-management platform for Sereya Law Firm built with Vite (React) on the frontend and Node.js / Express / PostgreSQL on the backend.

## Documentation

Full backend operations runbook (env vars, migrations, scripts, production checklist):

👉 **[server/README.md](./server/README.md)**

## Quick Start

```bash
# Frontend
npm install
npm run dev

# Backend (in a separate terminal)
cd server
cp .env.example .env   # fill in values
npm install
npm run migrate:up
npm start
```
