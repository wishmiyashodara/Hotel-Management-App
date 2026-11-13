const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel_management';

async function deepClean() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('--- Coconut Republik Database Deep Clean ---');
    
    // 1. Clean Employee Records
    const employees = await Employee.find();
    for (const emp of employees) {
      if (emp.email) {
        const cleanEmail = emp.email.trim().toLowerCase();
        if (emp.email !== cleanEmail) {
          console.log(`CLEANING email for employee: ${emp.name} (${emp.email} -> ${cleanEmail})`);
          emp.email = cleanEmail;
          await emp.save();
        }
      }
    }

    // 2. Clean User Records
    const users = await User.find();
    for (const user of users) {
      if (user.email) {
        const cleanEmail = user.email.trim().toLowerCase();
        if (user.email !== cleanEmail) {
          console.log(`CLEANING email for user: ${user.name} (${user.email} -> ${cleanEmail})`);
          user.email = cleanEmail;
          await user.save();
        }
      }
    }

    console.log('--- Deep Clean Complete! ---');
    await mongoose.disconnect();
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

deepClean();
