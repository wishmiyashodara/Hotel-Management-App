const express = require('express');
const router = express.Router();
const { 
  processPayment, 
  getAllPayments, 
  getMyPayments, 
  getPaymentById 
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Protected User routes
router.post('/', protect, processPayment);
router.get('/myhistory', protect, getMyPayments);
router.get('/:id', protect, getPaymentById);

// Protected Admin routes
router.get('/', protect, adminOnly, getAllPayments);

module.exports = router;
