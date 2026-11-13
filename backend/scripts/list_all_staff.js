const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel_management';

async function listStaff() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('--- Coconut Republik Staff User List ---');
    
    const staff = await User.find({ role: 'staff' }).select('name email role createdAt');
    
    if (staff.length === 0) {
      console.log('NO STAFF USERS FOUND IN DATABASE');
    } else {
      console.table(staff.map(s => ({
        Name: s.name,
        Email: s.email,
        Role: s.role,
        Created: s.createdAt
      })));
    }

    console.log('---------------------------------------');
    await mongoose.disconnect();
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

listStaff();
