const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Get token from header
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Attach user info to request (Do not fetch password)
      // We attach the payload directly to save a DB call, 
      // but let's do a quick check to ensure user still exists
      const userRes = await pool.query('SELECT id, tenant_id, role, email FROM users WHERE id = $1', [decoded.userId]);
      
      if (userRes.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'User no longer exists' });
      }

      req.user = userRes.rows[0];
      // CRITICAL: Set tenantId for isolation logic later
      req.tenantId = decoded.tenantId; 
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect };