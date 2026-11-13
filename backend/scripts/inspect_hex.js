const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel_management';

function toHex(str) {
  return Array.from(str).map(c => c.charCodeAt(0).toString(16)).join(' ');
}

async function inspectHex() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('--- Coconut Republik Hex Inspection ---');
    
    console.log('\nEMPLOYEES:');
    const employees = await Employee.find();
    employees.forEach(e => {
      console.log(`- ${e.name} | Email: "${e.email}" | Hex: ${e.email ? toHex(e.email) : 'N/A'}`);
    });

    console.log('\nSTAFF USERS:');
    const users = await User.find({ role: 'staff' });
    users.forEach(u => {
      console.log(`- ${u.name} | Email: "${u.email}" | Hex: ${u.email ? toHex(u.email) : 'N/A'}`);
    });

    console.log('---------------------------------------');
    await mongoose.disconnect();
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

inspectHex();
