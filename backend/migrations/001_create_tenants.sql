CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) CHECK (status IN ('active', 'suspended', 'trial')) DEFAULT 'active',
    subscription_plan VARCHAR(50) CHECK (subscription_plan IN ('free', 'pro', 'enterprise')) DEFAULT 'free',
    max_users INTEGER DEFAULT 5,
    max_projects INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);