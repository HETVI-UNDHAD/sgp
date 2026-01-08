# MERN Register Example

This repository contains a minimal MERN stack register example.

## Structure

- backend: Express + MongoDB API
- frontend: React app (CRA-style)

## Quick start (local)

1. Start MongoDB (or use a hosted MongoDB URI).

2. Backend:

```bash
cd backend
npm install
# copy backend/.env.example to backend/.env and edit MONGO_URI
node server.js
```

3. Frontend (development):

```bash
cd frontend
npm install
# Optionally set REACT_APP_API_URL to point to backend, or leave empty for same origin
npm start
```

By default the frontend will send requests to the value of `REACT_APP_API_URL` (if set) + `/api/register`,
or to `/api/register` on the current origin when unset. See `frontend/.env.example`.

## Common issue: "friend's laptop data not reaching my DB"

- If your friend runs the frontend on their laptop, `http://localhost:5000` refers to their laptop, not your server.
- To allow others to reach your backend, either deploy the backend to a public URL or run a tunnel (ngrok) and set `REACT_APP_API_URL` to the tunnel URL.

Example using ngrok:

```bash
# on the machine running the backend
ngrok http 5000
# ngrok will give you a public URL like https://abcd.ngrok.io
# set REACT_APP_API_URL=https://abcd.ngrok.io in friend's frontend .env
```

## Health check

The backend exposes a simple health endpoint: `GET /api/ping` which returns `{ ok: true }` when reachable.

## Notes

- CORS is enabled in `backend/server.js`, so cross-origin requests are allowed when the backend is reachable.
- Ensure the backend is running and `MONGO_URI` is correct (see `backend/.env.example`).
