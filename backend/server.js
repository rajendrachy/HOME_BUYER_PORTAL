const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

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

// Initialize HTTP server and Socket.io
const server = http.createServer(app);

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
    
    // In development, allow any localhost/127.0.0.1 origin
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
    if (process.env.NODE_ENV === 'development' && isLocalhost) {
      return callback(null, true);
    }

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

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Provide io to routes via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  // Example: Client joins a room with their userId
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room.`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: false })); // allow static files/images to load without strict CORB

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/auth/', authLimiter);

// Serve uploaded files
// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.pdf')) {
      res.set('Content-Type', 'application/pdf');
      res.set('Content-Disposition', 'inline');
    }
  }
}));


// ========== ROUTES ==========
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/banks', require('./routes/bankRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

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
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  console.error(`❌ [${new Date().toISOString()}] Error ${statusCode}:`, message);
  if (err.stack && process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({ 
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Set port
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
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