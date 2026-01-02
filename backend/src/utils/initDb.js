const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const bcrypt = require('bcrypt');

const runMigrations = async () => {
  console.log('⏳ Starting Database Migration...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Read Migration Files
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir).sort(); // Sort to ensure order (001, 002...)

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        console.log(`▶️ Running migration: ${file}`);
        await client.query(sql);
      }
    }

    // 2. Check if Seeds are needed (Check if superadmin exists)
    const checkRes = await client.query("SELECT * FROM users WHERE email = 'superadmin@system.com'");
    
    if (checkRes.rowCount === 0) {
      console.log('🌱 Seeding Data...');
      
      // We manually insert seeds here to ensure passwords are hashed correctly using bcrypt
      // This replaces the raw SQL seed file to ensure login works 100%
      
      const saltRounds = 10;
      const adminPass = await bcrypt.hash('Admin@123', saltRounds);
      const tenantAdminPass = await bcrypt.hash('Demo@123', saltRounds);
      const userPass = await bcrypt.hash('User@123', saltRounds);

      // Super Admin
      await client.query(`
        INSERT INTO users (email, password_hash, full_name, role, tenant_id)
        VALUES ('superadmin@system.com', $1, 'System Super Admin', 'super_admin', NULL)
      `, [adminPass]);

      // Demo Tenant
      const tenantRes = await client.query(`
        INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
        VALUES ('Demo Company', 'demo', 'active', 'pro', 25, 15)
        RETURNING id
      `);
      const tenantId = tenantRes.rows[0].id;

      // Tenant Admin
      await client.query(`
        INSERT INTO users (tenant_id, email, password_hash, full_name, role)
        VALUES ($1, 'admin@demo.com', $2, 'Demo Admin', 'tenant_admin')
      `, [tenantId, tenantAdminPass]);

      // Regular User
      const userRes = await client.query(`
        INSERT INTO users (tenant_id, email, password_hash, full_name, role)
        VALUES ($1, 'user1@demo.com', $2, 'User One', 'user')
        RETURNING id
      `, [tenantId, userPass]);

      // Project
      const projectRes = await client.query(`
        INSERT INTO projects (tenant_id, name, description, status, created_by)
        VALUES ($1, 'Project Alpha', 'First demo project', 'active', $2)
        RETURNING id
      `, [tenantId, userRes.rows[0].id]);

       // Task
       await client.query(`
        INSERT INTO tasks (tenant_id, project_id, title, description, status, priority, assigned_to)
        VALUES ($1, $2, 'Design Login Page', 'Create UI', 'in_progress', 'high', $3)
      `, [tenantId, projectRes.rows[0].id, userRes.rows[0].id]);
      
      console.log('✅ Seeding Complete');
    } else {
      console.log('ℹ️ Data already exists, skipping seed.');
    }

    await client.query('COMMIT');
    console.log('✅ Migrations & Seeds Finished Successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration Failed:', err);
    process.exit(1); // Exit container if DB fails
  } finally {
    client.release();
  }
};

module.exports = runMigrations;