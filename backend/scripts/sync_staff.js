const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel_management';

async function syncStaff() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('--- Coconut Republik Master Staff Sync ---');
    
    const employees = await Employee.find();
    console.log(`Found ${employees.length} employees. Checking for login accounts...`);
    
    for (const emp of employees) {
      if (!emp.email) {
        console.log(`Skipping ${emp.name} (No email found)`);
        continue;
      }
      
      const email = emp.email.trim().toLowerCase();
      let user = await User.findOne({ email });
      
      if (!user) {
        console.log(`CREATING login for: ${emp.name} (${email})`);
        await User.create({
          name: emp.name,
          email: email,
          phone: emp.phone || '',
          password: '12345678', // Defaulting to the password you used
          role: 'staff'
        });
      } else if (user.role !== 'staff') {
        console.log(`UPGRADING ${emp.name} to staff role...`);
        user.role = 'staff';
        await user.save();
      } else {
        console.log(`Account already active for: ${emp.name}`);
      }
    }

    console.log('--- Sync Complete! ---');
    await mongoose.disconnect();
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

syncStaff();
