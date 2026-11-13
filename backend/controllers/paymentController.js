const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { sendEmail } = require('../utils/emailService');

// @desc    Process a new payment
// @route   POST /api/payments
exports.processPayment = async (req, res) => {
  try {
    const { userId, bookingId, amount, method } = req.body;
    const mongoose = require('mongoose');

    if (!bookingId) {
      return res.status(400).json({ message: 'Payment must be linked to a valid booking or dining session.' });
    }

    // Prepare payment data
    const paymentData = {
      userId,
      amount,
      method,
      status: 'Paid'
    };

    // Only add bookingId if it's a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(bookingId)) {
      paymentData.bookingId = bookingId;
    }

    const payment = await Payment.create(paymentData);

    // Update the booking to mark it as Paid IF it's a real booking
    if (mongoose.Types.ObjectId.isValid(bookingId)) {
      const booking = await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'Paid' }, { new: true })
        .populate('userId', 'name email');

      // SEND EMAIL: Payment Confirmation
      if (booking && booking.userId) {
        await sendEmail(
          booking.userId.email,
          'Payment Successful - Coconut Republik',
          'Thank You for Your Payment! 💳',
          `We have successfully processed your payment of $${amount}. Your island services are fully confirmed.`,
          { ...booking.toObject(), customerName: booking.userId.name, totalAmount: amount }
        );
      }
    } else if (bookingId === 'standalone_dining') {
      // For standalone dining, we just confirm the payment was successful
      console.log(`Standalone Dining Payment of $${amount} received for User: ${userId}`);
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all payments (Admin Only)
// @route   GET /api/payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate({
        path: 'bookingId',
        populate: { path: 'roomId', select: 'roomNumber' }
      });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payments for a specific user
// @route   GET /api/payments/myhistory
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate({
        path: 'bookingId',
        populate: { path: 'roomId', select: 'roomNumber' }
      });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single payment receipt
// @route   GET /api/payments/:id
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('bookingId');
    if (payment) {
      res.json(payment);
    } else {
      res.status(404).json({ message: 'Payment record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
