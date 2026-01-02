-- 1. Insert Super Admin (Password: Admin@123)
-- Note: tenant_id is NULL for super_admin
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
VALUES (
    uuid_generate_v4(), 
    NULL, 
    'superadmin@system.com', 
    '$2b$10$wW5.u.7s6wG7a6.2.1.2.u1.2.3.4.5.6.7.8.9.0.1.2.3.4.5', -- Placeholder hash, we will fix this in backend logic or you can generate a real bcrypt hash
    'System Super Admin', 
    'super_admin'
) ON CONFLICT DO NOTHING;

-- 2. Insert Demo Tenant
INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Fixed UUID for reference
    'Demo Company', 
    'demo', 
    'active', 
    'pro', 
    25, 
    15
) ON CONFLICT DO NOTHING;

-- 3. Insert Tenant Admin (Password: Demo@123)
INSERT INTO users (tenant_id, email, password_hash, full_name, role)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@demo.com', 
    '$2b$10$YourGeneratedBcryptHashHereForDemo@123', 
    'Demo Admin', 
    'tenant_admin'
);

-- 4. Insert Regular User (Password: User@123)
INSERT INTO users (tenant_id, email, password_hash, full_name, role)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'user1@demo.com', 
    '$2b$10$YourGeneratedBcryptHashHereForUser@123', 
    'User One', 
    'user'
);

-- 5. Insert Sample Project
INSERT INTO projects (id, tenant_id, name, description, status, created_by)
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Project Alpha',
    'First demo project',
    'active',
    (SELECT id FROM users WHERE email = 'admin@demo.com' LIMIT 1)
);

-- 6. Insert Sample Task
INSERT INTO tasks (tenant_id, project_id, title, description, status, priority, assigned_to)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Design Login Page',
    'Create the UI for the login screen',
    'in_progress',
    'high',
    (SELECT id FROM users WHERE email = 'user1@demo.com' LIMIT 1)
);