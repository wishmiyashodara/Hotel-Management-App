const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Employee = require('../models/Employee');

dotenv.config({ path: path.join(__dirname, '../.env') });

const resetData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB... 🔌');

    // 1. Clear Bookings, Payments, and Orders first (Dependencies)
    await Booking.deleteMany({});
    console.log('✔ All Bookings removed');

    await Payment.deleteMany({});
    console.log('✔ All Payments removed');

    await Order.deleteMany({});
    console.log('✔ All Restaurant Orders removed');

    // 2. Clear Rooms
    await Room.deleteMany({});
    console.log('✔ All Rooms removed');

    // 3. Clear Employees
    await Employee.deleteMany({});
    console.log('✔ All Employees removed');

    // 4. Clear Users EXCEPT Admin
    const result = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`✔ All Customers removed (${result.deletedCount} users)`);
    console.log('✨ Admin account preserved.');

    console.log('\n🚀 SYSTEM RESET COMPLETE! You can now add fresh rooms and customers.');
    process.exit();
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  }
};

resetData();
