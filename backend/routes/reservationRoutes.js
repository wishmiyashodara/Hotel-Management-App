const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { protect, adminOnly, adminOrStaff } = require('../middleware/authMiddleware');

router.post('/', protect, reservationController.createReservation);
router.get('/my', protect, reservationController.getMyReservations);
router.get('/all', protect, adminOrStaff, reservationController.getAllReservations);
router.put('/:id', protect, adminOrStaff, reservationController.updateStatus);

module.exports = router;
