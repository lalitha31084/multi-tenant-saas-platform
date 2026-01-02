# Product Requirements Document (PRD)

## 1. User Personas

### 1.1 The Super Admin
* **Description:** The owner of the SaaS platform.
* **Goals:** Monitor system growth, manage subscription plans, identify abusive tenants.
* **Pain Points:** Lack of visibility into how many companies are using the platform.

### 1.2 The Tenant Admin
* **Description:** The manager of a specific organization (e.g., a Project Manager at "Video Corp").
* **Goals:** Onboard team members, organize projects, ensure work is getting done.
* **Pain Points:** Configuring permissions for every single user manually; fear of data leaking to other companies.

### 1.3 The End User
* **Description:** A developer or employee working on tasks.
* **Goals:** View assigned tasks, update status, see what is due next.
* **Pain Points:** Clunky interfaces, slow loading times, confusing navigation.

---

## 2. Functional Requirements (FR)

### Authentication Module
* **FR-001:** The system shall allow a new organization to register by providing a Company Name, Unique Subdomain, and Admin details.
* **FR-002:** The system shall allow users to log in using Email, Password, and Subdomain.
* **FR-003:** The system shall generate a JWT token upon successful login valid for 24 hours.

### Tenant Management Module
* **FR-004:** The system shall enforce data isolation so that users can only view data belonging to their `tenant_id`.
* **FR-005:** The system shall allow Super Admins to view a list of all registered tenants.
* **FR-006:** The system shall allow Tenant Admins to update their organization's name.

### User Management Module
* **FR-007:** The system shall allow Tenant Admins to invite/add new users to their organization.
* **FR-008:** The system shall enforce subscription limits (Max Users) before adding a new user.
* **FR-009:** The system shall allow Tenant Admins to delete users from their organization.

### Project Management Module
* **FR-010:** The system shall allow users to create new Projects with a Name, Description, and Status.
* **FR-011:** The system shall allow users to view a list of all Projects within their tenant.
* **FR-012:** The system shall enforce subscription limits (Max Projects) before creating a new project.

### Task Management Module
* **FR-013:** The system shall allow users to create Tasks inside a Project with Priority and Due Date.
* **FR-014:** The system shall allow users to update the status of a Task (Todo -> In Progress -> Completed).
* **FR-015:** The system shall allow users to assign a Task to a specific team member within the same tenant.

---

## 3. Non-Functional Requirements (NFR)

* **NFR-001 (Performance):** The Dashboard and Project List APIs must respond in under 300ms for standard payloads.
* **NFR-002 (Security):** All user passwords must be hashed using Bcrypt before storage.
* **NFR-003 (Scalability):** The database schema must use Indexes on `tenant_id` to ensure query performance does not degrade as tenant count grows.
* **NFR-004 (Availability):** The application must be containerized (Docker) to allow for rapid restart and deployment on any cloud infrastructure.
* **NFR-005 (Usability):** The Frontend must be responsive and usable on both Desktop (1920px) and Tablet (768px) viewports.