const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// DB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel_management';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('Connection Error:', err));

// Basic Route
app.get('/', (req, res) => {
  res.send('Hotel Management API is running...');
});

// Import Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/restaurant', require('./routes/restaurantRoutes'));
app.use('/api/email', require('./routes/emailRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));

