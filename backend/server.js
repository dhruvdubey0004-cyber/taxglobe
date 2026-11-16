const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./src/routes/auth');
const app = express();
const calcRoutes = require('./src/routes/calculator')
const treatyRoutes = require('./src/routes/treaty');
const taxRoute = require('./src/routes/tax');
const simulatorRoutes = require('./src/routes/simulator');
const chatRoutes = require('./src/routes/chat');


// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use("/api", calcRoutes);
app.use("/api", taxRoute);
app.use('/api', treatyRoutes);
app.use('/api/structure', simulatorRoutes);
app.use('/api', chatRoutes);
// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'TaxGlobe Backend Running...' });
});

// DB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB Error:', err.message));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;