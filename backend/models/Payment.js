const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking'
  },
  amount: { type: Number, required: true },
  method: { 
    type: String, 
    enum: ['Cash', 'Card', 'Online'], 
    required: true 
  },
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Paid', 'Pending', 'Failed'], 
    default: 'Pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
