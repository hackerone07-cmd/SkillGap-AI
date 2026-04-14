# SkillGap-AI

A full-stack AI interview platform with:
- A React + Vite frontend
- An Express + MongoDB backend
- Gemini-powered interview report generation

## Overview

SkillGap-AI helps users:
- Register/login securely
- Submit resume + job context for interview analysis
- Generate and view interview reports
- Track previously generated reports

## Tech Stack

### Frontend (`frontend/`)
- React
- Vite
- React Router
- Axios
- Sass
- ESLint

### Backend (`backend/`)
- Node.js
- Express
- MongoDB (Mongoose)
- JWT auth with cookie-based sessions
- Multer (resume upload)
- Google Gemini API integration

## Project Structure

```text
.
├── frontend/          # React client app
│   ├── src/
│   └── package.json
├── backend/           # Express API server
│   ├── src/
│   ├── server.js
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB connection string
- Google Gemini API key

## Setup

### 1) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure backend environment

Create `backend/.env`:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

### 3) Run the backend

From `backend/`:

```bash
npm start
```

Server runs on `http://localhost:3000` by default.

### 4) Run the frontend

From `frontend/`:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Available Scripts

### Frontend (`frontend/`)
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (`backend/`)
- `npm start` - Start API server

## API Routes

Base URL: `http://localhost:3000`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/get-me`

### Interview
- `POST /api/interview` (multipart form with `resume`)
- `GET /api/interview`
- `GET /api/interview/report/:interviewId`

## Important Notes

- Frontend API calls currently point to `http://localhost:3000` in the service files.
- Backend CORS currently allows `http://localhost:5173`.
- Keep secrets in `backend/.env`; do not commit them.

## Development Workflow

1. Start MongoDB and backend
2. Start frontend
3. Register/login from the UI
4. Generate and review interview reports