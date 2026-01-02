const bcrypt = require('bcrypt');
const pool = require('../config/db');
const generateToken = require('../utils/generateToken');

// @desc    Register a new tenant (and tenant admin)
// @route   POST /api/auth/register-tenant
// @access  Public
const registerTenant = async (req, res) => {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start Transaction

    // 1. Check if subdomain exists
    const subCheck = await client.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
    if (subCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Subdomain already exists' });
    }

    // 2. Create Tenant
    const tenantRes = await client.query(
      `INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects) 
       VALUES ($1, $2, 'active', 'free', 5, 3) RETURNING id`,
      [tenantName, subdomain]
    );
    const tenantId = tenantRes.rows[0].id;

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // 4. Create Admin User
    const userRes = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4, 'tenant_admin') RETURNING id, email, full_name, role`,
      [tenantId, adminEmail, hashedPassword, adminFullName]
    );

    await client.query('COMMIT'); // Commit Transaction

    // 5. Audit Log (We will implement the full audit helper later, simple log for now)
    // In a real scenario, call logAudit() here.

    res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId,
        subdomain,
        adminUser: userRes.rows[0]
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error during registration' });
  } finally {
    client.release();
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  try {
    let tenantId = null;

    // 1. Resolve Tenant ID from Subdomain (if provided)
    if (tenantSubdomain) {
      const tenantRes = await pool.query('SELECT id, status FROM tenants WHERE subdomain = $1', [tenantSubdomain]);
      if (tenantRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Tenant not found' });
      }
      if (tenantRes.rows[0].status !== 'active') {
        return res.status(403).json({ success: false, message: 'Tenant is not active' });
      }
      tenantId = tenantRes.rows[0].id;
    }

    // 2. Find User
    // If tenantId exists, search specifically in that tenant. 
    // If Super Admin (no tenantId provided or usually special portal), they might not send a subdomain.
    // However, the spec implies users log in via subdomain.
    
    let query = 'SELECT * FROM users WHERE email = $1';
    let params = [email];

    if (tenantId) {
      query += ' AND tenant_id = $2';
      params.push(tenantId);
    } else {
        // Special case: Try to find super admin if no subdomain provided
        query += ' AND role = \'super_admin\'';
    }

    const userRes = await pool.query(query, params);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = userRes.rows[0];

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 4. Generate Token
    const token = generateToken(user.id, user.tenant_id, user.role);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id
        },
        token,
        expiresIn: 86400 // 24 hours
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = req.user;
    
    // Fetch tenant details if user belongs to one
    let tenant = null;
    if (user.tenant_id) {
      const tenantRes = await pool.query('SELECT id, name, subdomain, subscription_plan FROM tenants WHERE id = $1', [user.tenant_id]);
      tenant = tenantRes.rows[0];
    }

    res.json({
      success: true,
      data: {
        ...user,
        tenant
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const logout = async (req, res) => {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = { registerTenant, login, getMe, logout };