const jwt = require('jsonwebtoken');

const generateToken = (userId, tenantId, role) => {
  return jwt.sign(
    { userId, tenantId, role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

module.exports = generateToken;