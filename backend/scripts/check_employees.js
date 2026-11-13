const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel_management';

async function checkEmployees() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('--- Employee Record Check ---');
    
    const employees = await Employee.find().select('name email position createdAt');
    
    if (employees.length === 0) {
      console.log('NO EMPLOYEE RECORDS FOUND');
    } else {
      console.table(employees.map(e => ({
        Name: e.name,
        Email: e.email,
        Position: e.position,
        Created: e.createdAt
      })));
    }

    console.log('----------------------------');
    await mongoose.disconnect();
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

checkEmployees();
