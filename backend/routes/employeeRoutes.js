const express = require('express');
const router = express.Router();
const { 
  addEmployee, 
  getAllEmployees, 
  getEmployeeById, 
  updateAttendance, 
  updateSchedule, 
  updatePayroll,
  deleteEmployee,
  getMyEmployeeProfile
} = require('../controllers/employeeController');
const { protect, adminOnly, adminOrStaff } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Routes
router.get('/me', protect, getMyEmployeeProfile);

// Protected Admin routes for employee management
router.post('/', protect, adminOnly, upload.single('image'), addEmployee);
router.get('/', protect, adminOnly, getAllEmployees);

// These must stay BELOW /me
router.get('/:id', protect, adminOnly, getEmployeeById);
router.put('/:id/attendance', protect, adminOrStaff, updateAttendance);
router.put('/:id/schedule', protect, adminOnly, updateSchedule);
router.put('/:id/payroll', protect, adminOnly, updatePayroll);
router.delete('/:id', protect, adminOnly, deleteEmployee);

module.exports = router;
