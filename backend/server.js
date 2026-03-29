const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

// Load .env from the current directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Check if .env loaded properly
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

console.log('✅ .env loaded successfully');

const connectDB = require('./config/db');
const { createIndexes } = require('./models');

// Connect to database
connectDB();

// Create database indexes
createIndexes();

// Initialize express app
const app = express();

// ========== CORS CONFIGURATION FOR PRODUCTION ==========
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://home-buyer-portal.vercel.app',
  'https://home-buyer-portal-git-main.vercel.app',
  'https://home-buyer-portal.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));


// ========== ROUTES ==========
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/banks', require('./routes/bankRoutes'));  // ← ADD THIS LINE

// ========== TEST ROUTES ==========
app.get('/', (req, res) => {
  res.json({ 
    message: 'Home Buyer Portal API is running!',
    status: 'success',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    database: process.env.MONGODB_URI ? 'Configured' : 'Not configured',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test-models', async (req, res) => {
  try {
    const Bank = require('./models/Bank');
    const Municipality = require('./models/Municipality');
    
    const banks = await Bank.find();
    const municipalities = await Municipality.find();
    
    res.json({
      success: true,
      message: '✅ Models are working!',
      banks,
      municipalities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== HEALTH CHECK FOR RENDER ==========
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ========== ERROR HANDLING ==========
// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Set port
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📝 Applications API: http://localhost:${PORT}/api/applications`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});