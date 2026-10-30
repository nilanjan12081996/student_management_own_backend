const express = require('express');
const routes = require('./routes');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for frontend communication
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-role, role, *');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Root health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Student Management API is running',
    health: '/api/health'
  });
});

// Main routes
app.use('/api', routes);

// Handle unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handling middleware (always includes CORS)
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
