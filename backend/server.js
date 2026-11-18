const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const calcRoutes = require('./src/routes/calculator');
const treatyRoutes = require('./src/routes/treaty');
const taxRoute = require('./src/routes/tax');
const simulatorRoutes = require('./src/routes/simulator');
const chatRoutes = require('./src/routes/chat');
const onboardingRoutes = require('./src/routes/onboarding');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Disable query buffering globally so Mongoose immediately alerts if DB is disconnected instead of hanging 10000ms
mongoose.set('bufferCommands', false);

// Serverless MongoDB Connection Cache (Vercel-ready)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is missing in environment variables.');
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    };
    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log('MongoDB Connected successfully');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

// Ensure DB connection before processing database routes
app.use(async (req, res, next) => {
  if (req.path === '/' || req.path === '/api/health') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err.message);
    return res.status(500).json({
      message: `Database Connection Error: ${err.message}. If deployed on Vercel, check that MONGO_URI is set in Vercel and 0.0.0.0/0 is allowed in MongoDB Atlas Network Access.`
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', calcRoutes);
app.use('/api', taxRoute);
app.use('/api', treatyRoutes);
app.use('/api/structure', simulatorRoutes);
app.use('/api', chatRoutes);
app.use('/api',onboardingRoutes)

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'TaxGlobe Backend Running...', status: 'OK' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start local listener only if not on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
