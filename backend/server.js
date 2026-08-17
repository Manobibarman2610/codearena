/**
 * CodeArena Backend Server
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CodeArena Judge API', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/problems',      require('./routes/problem.routes'));
app.use('/api/practice',      require('./routes/practice.routes'));
app.use('/api/submissions',   require('./routes/submission.routes'));
app.use('/api/leaderboard',   require('./routes/leaderboard.routes'));
app.use('/api/ai',            require('./routes/ai.routes'));
app.use('/api/faculty',       require('./routes/faculty.routes'));
app.use('/api/admin',         require('./routes/admin.routes'));
app.use('/api/contests',      require('./routes/contest.routes'));
app.use('/api/users',         require('./routes/user.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// Global error handler
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 CodeArena Judge API running on http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth API:    http://localhost:${PORT}/api/auth`);
  console.log(`💻 Judge API:   http://localhost:${PORT}/api/problems\n`);
});

module.exports = app;
