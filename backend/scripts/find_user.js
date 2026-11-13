const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel_management';

async function findUser() {
  const emailToFind = 'mino@gmail.com';
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`--- Searching for User: ${emailToFind} ---`);
    
    const user = await User.findOne({ email: emailToFind });
    
    if (!user) {
      console.log('USER NOT FOUND IN USER COLLECTION');
    } else {
      console.log('USER FOUND:');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Created:', user.createdAt);
    }

    console.log('---------------------------------------');
    await mongoose.disconnect();
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

findUser();
