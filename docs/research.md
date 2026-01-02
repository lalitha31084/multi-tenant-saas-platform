# Research & System Design Document

## 1. Multi-Tenancy Analysis

For this SaaS application, we evaluated three common multi-tenancy architecture patterns to determine the best fit for a project and task management system.

### Approach 1: Shared Database, Shared Schema (Selected)
In this approach, all tenants share the same database and the same tables. Data isolation is achieved logically by adding a `tenant_id` column to every table that contains tenant-specific data. Application middleware is responsible for ensuring that every query filters by this ID.

* **Pros:**
    * **Lowest Cost:** Only requires one database instance, significantly reducing infrastructure costs.
    * **Easiest Maintenance:** Database migrations are run once and apply to everyone immediately.
    * **Scalability:** Supports a high number of tenants easily without overhead per tenant.
* **Cons:**
    * **Isolation Risk:** Relies entirely on application code. A bug in a `WHERE` clause could leak data.
    * **Backup/Restore:** difficult to restore a single tenant's data without affecting others.

### Approach 2: Shared Database, Separate Schemas
All tenants share one database instance, but each tenant gets their own "Schema" (namespace) within that database (e.g., `schema_tenant_a`, `schema_tenant_b`).

* **Pros:**
    * **Better Isolation:** Data is physically separated at the schema level.
    * **customization:** Easier to support custom tables for specific VIP tenants.
* **Cons:**
    * **Migration Complexity:** Migrations must run N times (once for every tenant).
    * **Connection Overhead:** Can increase memory usage on the database server.

### Approach 3: Separate Databases
Each tenant gets their own completely isolated database instance (e.g., running in a separate container or RDS instance).

* **Pros:**
    * **Highest Security:** Absolute physical isolation.
    * **Independence:** No "noisy neighbor" effect; one tenant's heavy load doesn't crash another's.
* **Cons:**
    * **Highest Cost:** Prohibitively expensive for a startup/MVP.
    * **Operational Nightmare:** Managing hundreds of database connections and backups.

### Justification for Selected Approach
We chose **Shared Database with Shared Schema**.
1.  **Complexity vs. Value:** For a standard Task Management SaaS, the data structure is uniform across all clients. The overhead of managing separate schemas is unnecessary.
2.  **Resource Efficiency:** Since this application is containerized with Docker, running a single Postgres instance is far more performant than trying to orchestrate dynamic schema creation.
3.  **Development Speed:** We can use standard ORM/SQL patterns and handle isolation via a single robust Middleware (`authMiddleware.js`), which significantly speeds up development time for the deadline.

---

## 2. Technology Stack Justification

### Backend: Node.js with Express
* **Why:** Node.js's non-blocking I/O model is ideal for real-time applications like task management where many users might be updating status simultaneously.
* **Ecosystem:** The NPM ecosystem offers robust libraries for JWT (jsonwebtoken), Hashing (bcrypt), and Database (pg), allowing us to build the MVP in under 48 hours.
* **Alternatives:** Python (Django) was considered but is heavier; Go was considered but has a steeper learning curve for a rapid-prototyping challenge.

### Frontend: React.js
* **Why:** React's component-based architecture is perfect for the dashboard interface (reusable cards, modal forms, tables).
* **State Management:** React Context API allows us to easily manage Global Auth State (User/Tenant info) without the bloat of Redux.
* **SPA:** A Single Page Application provides a smoother user experience (no page reloads) which feels more like a native app.

### Database: PostgreSQL
* **Why:** Multi-tenancy requires strict relational integrity (Foreign Keys). Postgres is the gold standard for relational data and supports JSONB if we ever need flexible fields.
* **Reliability:** ACID compliance ensures that a Tenant Registration (which touches multiple tables) never leaves the database in a half-baked state.

### Deployment: Docker & Docker Compose
* **Why:** The requirement mandates containerization. Docker ensures that the application runs exactly the same on the developer's machine as it does on the evaluator's machine, eliminating "it works on my machine" bugs.

---

## 3. Security Considerations

To secure this multi-tenant environment, we implemented the following 5 layers of security:

1.  **Row-Level Logic Isolation:**
    * Every single API endpoint (except registration) runs through `authMiddleware`.
    * This middleware decodes the JWT, extracts the `tenant_id`, and attaches it to the request object.
    * Controllers **never** trust user input for the Tenant ID; they always use the ID from the validated Token.

2.  **Stateless Authentication (JWT):**
    * We use JSON Web Tokens signed with a secure secret.
    * The token contains the `tenantId` and `role` in the payload, preventing a user from manipulating their local storage to access another tenant.
    * Tokens expire in 24 hours to limit the window of opportunity if a token is stolen.

3.  **Role-Based Access Control (RBAC):**
    * We implemented three strict roles: `super_admin`, `tenant_admin`, and `user`.
    * Middleware checks `req.user.role` before allowing sensitive actions (e.g., only `tenant_admin` can DELETE a user).

4.  **Password Security:**
    * Passwords are **never** stored in plain text.
    * We use `bcrypt` with salt rounds of 10 to hash passwords before storage.
    * We verify passwords using `bcrypt.compare()` during login.

5.  **API Security & Input Hygiene:**
    * We use Parameterized Queries (via the `pg` library) for ALL database interactions. This makes SQL Injection impossible, which is the most common attack vector in SaaS apps.