const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  salary: { type: Number, required: true },
  shift: { type: String, enum: ['Morning', 'Evening', 'Night'], default: 'Morning' },
  joinDate: { type: String }, // Format YYYY-MM-DD
  image: { type: String },
  attendance: [{
    date: { type: String }, // Format YYYY-MM-DD
    status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' }
  }],
  schedule: [{
    date: { type: String },
    shift: { type: String, enum: ['Morning', 'Evening', 'Night'] }
  }],
  payroll: [{
    month: { type: String },
    amount: { type: Number },
    status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
    paidDate: { type: String }
  }],
  isCurrentlyWorking: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
