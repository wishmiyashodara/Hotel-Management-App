const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/emailService');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @desc    Send a test email to verify SMTP settings
// @route   POST /api/email/test
router.post('/test', protect, adminOnly, async (req, res) => {
  const { testEmail } = req.body;
  
  if (!testEmail) {
    return res.status(400).json({ message: 'Please provide a test email address' });
  }

  const success = await sendEmail(
    testEmail,
    'Coconut Republik - Test Connection',
    'System Connection Successful! 🌴',
    'Congratulations! Your smart email system is now correctly connected to Coconut Republik. All your future booking notifications will be sent automatically.',
    { _id: 'TEST123456', customerName: req.user.name, checkInDate: new Date(), checkOutDate: new Date(), totalAmount: 0 }
  );

  if (success) {
    res.json({ message: 'Test email sent successfully!' });
  } else {
    res.status(500).json({ message: 'Failed to send test email. Please check your .env settings.' });
  }
});

module.exports = router;
