const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks'], 
    required: true 
  },
  description: { type: String },
  image: { type: String, default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
