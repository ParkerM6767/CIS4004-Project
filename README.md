# METAGAME — Video Game Review Platform

A full-stack MERN application for discovering and reviewing video games.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT (JSON Web Tokens), bcryptjs |

## Features

- **Browse** a grid of games with cover art and star ratings
- **Review** any game with a 1–5 star rating and written review
- **Authentication** — login, signup, JWT session, role-based access
- **Admin Panel** — full CRUD for games, reviews, and users
- **Search** games by title, description, or developer
- **Pagination** on all lists

---

## Quick Start Guide

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod`) **or** a MongoDB Atlas connection string

### 1. Clone & Install

```bash
# Install all dependencies
npm run install-all
```

### 2. Configure Environment Variables

```bash
cd server
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
```

### 3. Seed the Database (optional)

```bash
cd server
npm run seed
# Creates starting users, and populates games and their respective reviewers
```

### 4. Run Development Servers

```bash
# From the root directory — starts both server (port 5000) and client (port 5173)
npm run dev
```

Open http://localhost:5173

---

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gamevault
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | — | Create account |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | User | Get current user |
| POST | `/api/auth/logout` | User | Invalidate session |

### Games
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/games` | — | List games (supports `?search=`, `?page=`, `?limit=`) |
| GET | `/api/games/:id` | — | Get single game |
| POST | `/api/games` | Admin | Create game |
| PUT | `/api/games/:id` | Admin | Update game |
| DELETE | `/api/games/:id` | Admin | Delete game + cascade reviews |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reviews?gameId=xxx` | — | Reviews for a game |
| GET | `/api/reviews/all` | Admin | All reviews (paginated) |
| POST | `/api/reviews` | User | Post review (1 per user per game) |
| PUT | `/api/reviews/:id` | Owner/Admin | Update review |
| DELETE | `/api/reviews/:id` | Owner/Admin | Delete review |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Admin | List all users |
| PUT | `/api/users/:id` | Admin | Update user (username, role, password) |
| DELETE | `/api/users/:id` | Admin | Delete user |
