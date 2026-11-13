const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getAllBookings, 
  getMyBookings, 
  updateBookingStatus, 
  cancelBooking,
  hardDeleteBooking
} = require('../controllers/bookingController');
const { protect, adminOnly, adminOrStaff } = require('../middleware/authMiddleware');

// Protected User routes
router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);
router.delete('/:id', protect, cancelBooking);

// Protected Admin/Staff routes
router.get('/', protect, adminOrStaff, getAllBookings);
router.put('/:id/status', protect, adminOrStaff, updateBookingStatus);
router.delete('/:id/hard', protect, adminOnly, hardDeleteBooking);

module.exports = router;
