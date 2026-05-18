# TaskFlow — Task Manager

A full-stack task management web application with role-based access (Admin & Employee), real-time notifications, task notes, and a modern dark-mode UI.

**Live demo**
- Frontend: [https://purplemedia-management.vercel.app](https://purplemedia-management.vercel.app)
- Backend API: [https://purplemedia-management.onrender.com](https://purplemedia-management.onrender.com)

---

## Features

### Authentication
- User registration and login (JWT)
- Admin registration requires a secret code
- Forgot / reset password flow
- Disabled accounts cannot log in

### Admin
- Dashboard with task statistics chart
- Create, assign, update, and delete tasks
- Manage users (enable/disable, delete)
- Assign multiple employees per task
- Add document links (e.g. Google Docs) when creating tasks
- Per-task **Notes** panel (text notes)
- Real-time notifications when tasks are assigned

### Employee
- **My Tasks** dashboard with task cards
- Update task status (Pending → In Progress → Completed)
- Click task title to open linked document (if provided)
- Add and view text notes per task
- Real-time bell notifications for new assignments

### UI
- Dark mode by default (toggle in navbar)
- Responsive sidebar navigation
- Slide-out notes panel
- Color-coded status and priority badges

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router, Axios, Socket.io Client, Recharts, Lucide Icons |
| **Backend** | Node.js, Express 5, MongoDB (Mongoose), JWT, bcrypt, Socket.io |
| **Database** | MongoDB Atlas |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## Project Structure

```
Task manager/
├── backend/
│   ├── controllers/     # Route logic (auth, tasks, users)
│   ├── middleware/      # JWT auth & role checks
│   ├── models/          # User, Task, Project schemas
│   ├── routes/          # API route definitions
│   ├── utils/           # Socket notification helpers
│   ├── server.js        # Express + Socket.io entry point
│   ├── .env.example     # Environment template (safe to commit)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, Sidebar, NotesPanel, etc.
│   │   ├── context/     # Auth, Socket, Notifications
│   │   ├── pages/       # Login, Dashboard, Tasks, Users...
│   │   └── utils/       # API helper
│   ├── .env.example
│   └── package.json
├── .gitignore           # Ignores .env and secrets
└── README.md
```

---

## Getting Started (Local)

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ (20 recommended)
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "Task manager"
```

### 2. Backend setup

```bash
cd backend
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

**`backend/.env` example:**

```env
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your-secret-key
ADMIN_REGISTRATION_SECRET=admin123
PORT=5000
```

Start the API:

```bash
npm run dev
```

Server runs at **http://localhost:5000**

Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**

Vite proxies `/api` to `localhost:5000` in development — no frontend `.env` needed locally.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `ADMIN_REGISTRATION_SECRET` | Code required to register as Admin |
| `PORT` | Server port (default `5000`) |
| `CLIENT_URL` | Frontend URL (for password-reset links) |
| `CORS_ORIGIN` | Allowed frontend origin(s), comma-separated |

### Frontend (production only — `frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL, no trailing slash (e.g. `https://your-api.onrender.com`) |
| `VITE_SOCKET_URL` | Same as API URL for real-time notifications |

> **Note:** Vite env vars are embedded at **build time**. Redeploy frontend after changing them.

---

## Default Roles

| Role | Access |
|------|--------|
| **Admin** | Dashboard, Tasks, Users, Profile |
| **Employee** | My Tasks, Profile |

**Admin registration code:** set via `ADMIN_REGISTRATION_SECRET` (default in examples: `admin123`).

---

## API Overview

Base URL: `/api`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register user |
| POST | `/auth/login` | Public | Login |
| POST | `/auth/forgotpassword` | Public | Request password reset |
| PUT | `/auth/resetpassword/:token` | Public | Reset password |
| GET | `/tasks` | Auth | List tasks (filtered by role) |
| POST | `/tasks` | Admin | Create task |
| PUT | `/tasks/:id` | Admin | Update task |
| DELETE | `/tasks/:id` | Admin | Delete task |
| PUT | `/tasks/:id/status` | Auth | Update status |
| POST | `/tasks/:id/notes` | Auth | Add text/link note |
| GET | `/users` | Admin | List users |
| PUT | `/users/:id/access` | Admin | Toggle user active |
| DELETE | `/users/:id` | Admin | Delete user |
| GET | `/users/profile` | Auth | Get own profile |
| GET | `/health` | Public | Health check |

---

## Deployment

Backend and frontend are deployed **separately**.

### Backend — Render

1. Create a **Web Service** connected to your GitHub repo.
2. Settings:

   | Field | Value |
   |-------|--------|
   | **Root Directory** | `backend` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |

3. Add environment variables in the Render dashboard (not from `.env` file):

   ```
   MONGO_URI=your-atlas-connection-string
   JWT_SECRET=your-secret
   ADMIN_REGISTRATION_SECRET=admin123
   NODE_ENV=production
   CLIENT_URL=https://your-frontend.vercel.app
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

4. In **MongoDB Atlas → Network Access**, allow Render to connect (`0.0.0.0/0` for testing).

### Frontend — Vercel

1. Import the repo and set **Root Directory** to `frontend`.
2. Add environment variables:

   ```
   VITE_API_URL=https://your-backend.onrender.com
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

3. Deploy. Framework preset: **Vite**.

4. Update Render `CORS_ORIGIN` and `CLIENT_URL` to match your Vercel URL exactly (no trailing slash).

---

## Real-Time Notifications

- Uses **Socket.io** with user-specific rooms.
- Employees receive a notification when:
  - A new task is assigned to them
  - They are added to an existing task
- Notifications appear in the navbar bell and persist in `localStorage`.

---

## Security Notes

- **Never commit** `backend/.env` — it is listed in `.gitignore`.
- Use `.env.example` files as templates only.
- Set strong `JWT_SECRET` and `ADMIN_REGISTRATION_SECRET` in production.
- Rotate MongoDB credentials if they are ever exposed.

---

## Scripts Reference

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (development) |
| `npm start` | Start production server |
| `npm run build` | No-op (for hosts that require a build step) |

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Cannot find module 'express'` on Render | Set **Root Directory** to `backend` and **Build Command** to `npm install` |
| Login works locally but not on Vercel | Redeploy frontend after setting `VITE_API_URL`; set `CORS_ORIGIN` on Render |
| CORS errors | `CORS_ORIGIN` must exactly match frontend URL (https, no trailing `/`) |
| MongoDB connection failed | Check Atlas IP whitelist and `MONGO_URI` in Render env |
| Notifications not showing | Set `VITE_SOCKET_URL` and redeploy frontend; keep backend tab open |

---

## License

ISC
