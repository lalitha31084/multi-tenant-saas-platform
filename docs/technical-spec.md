# Technical Specification

## 1. Project Structure

The project is organized as a monorepo with separate directories for Backend and Frontend, orchestrated by Docker Compose.

```text
multi-tenant-saas/
├── docker-compose.yml      # Orchestrates DB, Backend, Frontend services
├── README.md               # Entry point documentation
├── submission.json         # Credentials for automated testing
├── docs/                   # Documentation folder
│
├── backend/                # Node.js API Service
│   ├── Dockerfile          # Backend container definition
│   ├── migrations/         # SQL files for schema creation (001_..., 002_...)
│   ├── seeds/              # SQL/Logic for initial data population
│   └── src/
│       ├── config/         # DB Connection setup
│       ├── controllers/    # Request logic (Auth, Tenant, User, Project, Task)
│       ├── middleware/     # Auth & Error handling
│       ├── routes/         # API Route definitions
│       ├── utils/          # Helpers (Audit Logger, DB Init)
│       └── index.js        # Server Entry point
│
└── frontend/               # React Application
    ├── Dockerfile          # Frontend container definition
    ├── public/             # Static assets
    └── src/
        ├── components/     # Reusable UI (Navbar, Cards, PrivateRoute)
        ├── context/        # Global Auth State (Context API)
        ├── pages/          # Full page views (Dashboard, Login, ProjectList)
        ├── services/       # Axios API configuration & Interceptors
        └── App.js          # Main Router & Layout