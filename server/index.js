require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const tableRoutes = require('./routes/tableRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use Routes
app.use('/api', authRoutes);
app.use('/api', menuRoutes);
app.use('/api', orderRoutes);
app.use('/api', tableRoutes);
app.use('/api', reservationRoutes);
app.use('/api', paymentRoutes);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on port ${PORT}`);
  });
}

module.exports = app;
