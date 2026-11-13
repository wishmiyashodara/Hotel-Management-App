const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel_management';

async function listUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('--- ALL Registered Users ---');
    
    const users = await User.find().select('name email role createdAt');
    
    if (users.length === 0) {
      console.log('NO USERS FOUND');
    } else {
      console.table(users.map(u => ({
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Created: u.createdAt
      })));
    }

    console.log('----------------------------');
    await mongoose.disconnect();
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

listUsers();
