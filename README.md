# MERN Register Example

This repository contains a minimal MERN stack register example.

## Structure

- backend: Express + MongoDB API
- frontend: React app (CRA-style)

## Run Backend

```bash
cd backend
npm install
node server.js
```

Backend will use `.env` in `backend/.env` (PORT and MONGO_URI).

## Run Frontend

```bash
cd frontend
npm install
npm start
```

The React app will request `http://localhost:5000/api/register` to register users.

## Notes

- Ensure MongoDB is running locally.
- You can use MongoDB Compass to inspect the `teamchat` database.
