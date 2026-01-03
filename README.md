# Multi-Tenant SaaS Platform

A production-ready, Dockerized SaaS application for Project and Task Management. This system features complete data isolation, role-based access control, and subscription management.

## Project Description

This application serves as a comprehensive solution for organizations to manage teams, projects, and tasks securely. It is designed with a multi-tenant architecture where a single instance serves multiple organizations (tenants), but each tenant's data is strictly isolated.

## Features

* **Multi-Tenancy:** Complete data isolation using a shared-database/shared-schema approach with unique Subdomains.
* **Authentication:** Secure JWT-based auth with Role-Based Access Control (Super Admin, Tenant Admin, User).
* **Projects & Tasks:** Full CRUD capabilities for managing team projects and assigning tasks with priorities and due dates.
* **User Management:** Tenant Admins can invite users and manage roles within their organization.
* **Subscription Limits:** Enforces limits on maximum users and projects based on the tenant's subscription plan (Free, Pro, Enterprise).
* **Audit Logging:** Tracks critical actions like user creation and project deletion.
* **Dockerized:** One-command deployment for Database, Backend, and Frontend.

## Technology Stack

* **Frontend:** React.js 18, CSS3, Context API.
* **Backend:** Node.js 18, Express.js.
* **Database:** PostgreSQL 15.
* **DevOps:** Docker, Docker Compose.

## Architecture Overview

The system follows a 3-Tier architecture:
1.  **Frontend:** React SPA communicating via REST API.
2.  **Backend:** Node.js/Express handling logic, auth, and tenant isolation middleware.
3.  **Database:** PostgreSQL storing relational data with foreign key constraints.

See [docs/architecture.md](docs/architecture.md) for the detailed architecture diagram.

## Installation & Setup

### Prerequisites
* Docker & Docker Compose installed on your machine.

### Quick Start
1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd multi-tenant-saas
    ```

2.  **Start the application:**
    ```bash
    docker-compose up --build -d
    ```
    *This command will build the images, start the containers, run database migrations, and seed the initial data automatically.*

3.  **Verify Status:**
    Run the following command to check if the backend has finished setting up:
    ```bash
    docker logs -f backend
    ```
    Wait for the message: `✅ Migrations & Seeds Finished Successfully`.

4.  **Access the App:**
    * **Frontend:** [http://localhost:3000](http://localhost:3000)
    * **Backend API:** [http://localhost:5000](http://localhost:5000)
    * **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

## Environment Variables

The application is pre-configured for this submission via `docker-compose.yml`.

* **DB_HOST:** `database`
* **DB_PORT:** `5432`
* **JWT_SECRET:** `supersecretkey12345`
* **FRONTEND_URL:** `http://frontend:3000`

## API Documentation

The API provides 19 endpoints covering Auth, Tenants, Users, Projects, and Tasks.
See [docs/architecture.md](docs/architecture.md) or [docs/API.md](docs/API.md) for the full list of endpoints.

## Testing Credentials

The system is automatically seeded with the following credentials for testing (as defined in `submission.json`):

**1. Demo Tenant Admin**
* **URL:** [http://localhost:3000](http://localhost:3000)
* **Subdomain:** `demo`
* **Email:** `admin@demo.com`
* **Password:** `Demo@123`

**2. Demo Regular User**
* **URL:** [http://localhost:3000](http://localhost:3000)
* **Subdomain:** `demo`
* **Email:** `user1@demo.com`
* **Password:** `User@123`

**3. Super Admin**
* **Email:** `superadmin@system.com`
* **Password:** `Admin@123`
* *(Note: Super Admin login is primarily for API testing)*

## Demo Video

https://drive.google.com/file/d/1rCrndvdcdOYcKk7NQIqQ4dgW66a6xFwO/view?usp=sharing
