# METAGAME — Video Game Review Platform

A full-stack MERN application for discovering and reviewing video games.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Tailwind CSS v3 (dark mode) |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT (JSON Web Tokens), bcryptjs |

## Features

- **Browse** a grid of games with cover art and star ratings
- **Review** any game with a 1–5 star rating and written review
- **Authentication** — login, signup, JWT session, role-based access
- **Dark Mode** toggle (persists across sessions)
- **Admin Panel** — full CRUD for games, reviews, and users
- **Search** games by title, description, or developer
- **Pagination** on all lists

---

## Project Structure

```
gamevault/
├── server/                  # Express API
│   ├── models/
│   │   ├── User.js          # username, password (hashed), role, uuid, JWT session
│   │   ├── Game.js          # title, description, author, coverImage, rating
│   │   └── Review.js        # rating, description, author ref, game ref
│   ├── routes/
│   │   ├── auth.js          # POST /login, /signup, GET /me, POST /logout
│   │   ├── games.js         # CRUD /games
│   │   ├── reviews.js       # CRUD /reviews
│   │   └── users.js         # Admin CRUD /users
│   ├── middleware/
│   │   └── auth.js          # protect, requireAdmin
│   ├── seed.js              # Sample data seeder
│   └── index.js             # Express entry point
│
└── client/                  # React SPA
    └── src/
        ├── context/
        │   ├── AuthContext.jsx   # login/logout/signup state
        │   └── ThemeContext.jsx  # dark/light toggle
        ├── components/
        │   ├── Navbar.jsx
        │   ├── GameCard.jsx
        │   ├── StarRating.jsx    # interactive + display modes
        │   ├── Modal.jsx
        │   ├── Toast.jsx         # notification system
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── HomePage.jsx      # game grid with search
            ├── GamePage.jsx      # game detail + reviews feed
            ├── LoginPage.jsx
            ├── SignupPage.jsx
            └── AdminPage.jsx     # tabbed admin panel (Games / Reviews / Users)
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod`) **or** a MongoDB Atlas connection string

### 1. Clone & Install

```bash
# Install all dependencies
npm run install-all
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
```

### 3. Seed the Database (optional)

```bash
cd server
npm run seed
# Creates: admin/admin123, gamer_pro/password123, retro_fan/password123
# + 6 games and sample reviews
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

---

## User Roles

| Feature | Standard User | Admin |
|---------|--------------|-------|
| Browse games | ✅ | ✅ |
| Read reviews | ✅ | ✅ |
| Post reviews | ✅ | ✅ |
| Edit own reviews | ✅ | ✅ |
| Delete own reviews | ✅ | ✅ |
| Admin panel | ❌ | ✅ |
| Add/edit/delete games | ❌ | ✅ |
| Edit/delete any review | ❌ | ✅ |
| Manage users | ❌ | ✅ |

> **Note:** The first user to sign up is automatically made an admin.

---

## Deployment

### Backend (e.g. Railway, Render, Fly.io)
1. Set environment variables in your hosting dashboard
2. Set `MONGODB_URI` to your Atlas connection string
3. Deploy the `server/` directory

### Frontend (e.g. Vercel, Netlify)
1. Build: `cd client && npm run build`
2. Set `VITE_API_URL` if not using a proxy
3. Deploy the `client/dist/` directory
