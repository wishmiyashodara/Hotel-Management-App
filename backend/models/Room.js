const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  roomType: { 
    type: String, 
    enum: ['Single', 'Double', 'Triple', 'Suite'], 
    required: true 
  },
  pricePerNight: { type: Number, required: true },
  capacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },
  description: { type: String },
  image: { type: String, default: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304' },
  hasAC: { type: Boolean, default: true },
  availabilityStatus: { 
    type: String, 
    enum: ['Available', 'Occupied', 'Maintenance'], 
    default: 'Available' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
