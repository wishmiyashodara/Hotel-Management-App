const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  roomNumber: { type: String, required: false },
  status: { 
    type: String, 
    enum: ['Pending', 'Preparing', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  orderType: { 
    type: String, 
    enum: ['Room Service', 'Takeaway', 'Table Reservation'], 
    default: 'Room Service' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
