# API Documentation

This document details the 19 RESTful API endpoints available in the Multi-Tenant SaaS Platform.

**Base URL:** `http://localhost:5000/api`

---

## 1. Authentication Module

### Register Tenant
Register a new organization and its administrator.
* **Endpoint:** `POST /auth/register-tenant`
* **Auth Required:** No
* **Request Body:**
  ```json
  {
    "tenantName": "Video Corp",
    "subdomain": "video",
    "adminEmail": "admin@video.com",
    "adminPassword": "Password123",
    "adminFullName": "John Doe"
  }