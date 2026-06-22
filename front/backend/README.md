# Sankalp Classes — Backend API

Node.js + Express + MongoDB API for the Sankalp Classes coaching portal.

## Setup

1. Install MongoDB locally (or use MongoDB Atlas and set `MONGODB_URI` in `.env`).

2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Copy `.env.example` to `.env` and adjust if needed.

4. Start the API:
   ```bash
   npm run dev
   ```

The server runs on **http://localhost:4000** and seeds default data on first start.

## Default login

| Role | Email | Password |
|------|-------|----------|
| Head Admin | `owner@sankalp.com` | `password` |

Students register via `/student/register`.

## API routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Student registration |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| PATCH | `/api/auth/profile` | Update profile |
| PATCH | `/api/auth/password` | Change password |
| GET | `/api/users` | List users (admin) |
| POST | `/api/users` | Create user (admin) |
| PATCH | `/api/users/:id` | Edit student (admin) |
| PATCH | `/api/users/:id/courses` | Assign courses |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/files` | List media files |
| POST | `/api/files` | Upload files (multipart) |
| PATCH | `/api/files/:id` | Update file metadata |
| DELETE | `/api/files/:id` | Delete file |
| GET | `/api/notifications` | User notifications |
| PATCH | `/api/notifications/:id/read` | Mark read |
| PATCH | `/api/notifications/read-all` | Mark all read |
| GET | `/api/feedback/teachers` | List teachers |
| POST | `/api/feedback/ratings` | Submit teacher rating |
| GET | `/api/feedback/ratings/summary` | Rating overview (head admin) |
| POST | `/api/feedback/student/:id` | Admin feedback to student |
| GET | `/api/exams` | List mock exams |
| POST | `/api/exams` | Create exam (admin) |
| GET | `/api/exams/:id/questions` | Exam questions |
| POST | `/api/exams/:id/attempts` | Submit attempt |
| GET | `/api/feed` | Feed posts |
| POST | `/api/feed` | Create post |

All routes except `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, and `/api/health` require `Authorization: Bearer <token>`.
