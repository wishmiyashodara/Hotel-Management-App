const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel_management';

// CONFIGURE THE STAFF DETAILS HERE:
const STAFF_EMAIL = 'methmi@gmail.com';
const STAFF_PASSWORD = 'staff123';
const STAFF_NAME = 'Methmi Staff';

async function fixStaff() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('--- Coconut Republik Staff Fixer ---');
    console.log(`Connecting to: ${MONGO_URI}`);

    let user = await User.findOne({ email: STAFF_EMAIL.trim().toLowerCase() });

    if (!user) {
      console.log(`Creating NEW staff account for: ${STAFF_EMAIL}`);
      user = await User.create({
        name: STAFF_NAME,
        email: STAFF_EMAIL.trim().toLowerCase(),
        password: STAFF_PASSWORD,
        role: 'staff'
      });
      console.log('SUCCESS: Staff account created!');
    } else {
      console.log(`UPDATING existing account for: ${STAFF_EMAIL}`);
      user.role = 'staff';
      user.password = STAFF_PASSWORD;
      user.name = STAFF_NAME;
      await user.save();
      console.log('SUCCESS: Staff account updated & password reset!');
    }

    console.log('------------------------------------');
    console.log('Methmi can now log in with:');
    console.log(`Email: ${STAFF_EMAIL}`);
    console.log(`Password: ${STAFF_PASSWORD}`);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

fixStaff();
