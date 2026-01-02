const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const userRoutes = require('./routes/userRoutes'); 
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

const pool = require('./config/db');
const runMigrations = require('./utils/initDb');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' })); // Allow requests from frontend
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/tenants/:tenantId/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes);
app.use('/api/users', require('./routes/userOperationsRoutes'));

// Health Check (MANDATORY per requirements)
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Placeholder Route
app.get('/', (req, res) => {
  res.send('Multi-Tenant SaaS API is running');
});

// Start Server
const startServer = async () => {
  // 1. Run Migrations BEFORE starting server
  await runMigrations();

  // 2. Start Listener
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();