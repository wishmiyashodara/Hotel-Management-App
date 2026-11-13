const Employee = require('../models/Employee');
const User = require('../models/User');

// @desc    Add a new employee
// @route   POST /api/employees
exports.addEmployee = async (req, res) => {
  console.log('--- ADD EMPLOYEE REQUEST ---');
  console.log('Body:', req.body);
  try {
    const { name, phone, password, position } = req.body;
    const email = req.body.email?.trim().toLowerCase();
    console.log('Processed Email:', email);
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create a staff user account
      user = await User.create({
        name,
        email,
        phone,
        password,
        role: 'staff'
      });
    } else {
      // Update existing user to staff role and set new password
      user.role = 'staff';
      user.password = password;
      user.phone = phone || user.phone;
      user.name = name || user.name;
      await user.save();
    }

    const employeeData = { ...req.body };
    if (req.file) {
      employeeData.image = `/uploads/${req.file.filename}`;
    }
    
    const employee = await Employee.create(employeeData);
    res.status(201).json({ employee, userAccount: 'Created' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get current logged in employee profile
// @route   GET /api/employees/me
exports.getMyEmployeeProfile = async (req, res) => {
  try {
    const searchEmail = req.user.email?.trim();
    console.log(`--- ROBUST PROFILE LOOKUP FOR: "${searchEmail}" ---`);
    
    // Using Regex for case-insensitive and flexible matching
    const employee = await Employee.findOne({ 
      email: { $regex: new RegExp(`^${searchEmail}$`, 'i') } 
    });
    
    console.log(`RESULT: ${employee ? 'Found ' + employee.name : 'NOT FOUND'}`);
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all employees
// @route   GET /api/employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update employee attendance
// @route   PUT /api/employees/:id/attendance
exports.updateAttendance = async (req, res) => {
  try {
    const { date, status } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (employee) {
      // Logic: Prevent duplicate attendance for the same day
      const alreadyMarked = employee.attendance.find(a => a.date === date);
      if (alreadyMarked) {
        alreadyMarked.status = status;
      } else {
        employee.attendance.push({ date, status });
      }

      await employee.save();
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update employee schedule
// @route   PUT /api/employees/:id/schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { date, shift } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (employee) {
      const alreadyScheduled = employee.schedule.find(s => s.date === date);
      if (alreadyScheduled) {
        alreadyScheduled.shift = shift;
      } else {
        employee.schedule.push({ date, shift });
      }

      await employee.save();
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update employee payroll (Salary Payment)
// @route   PUT /api/employees/:id/payroll
exports.updatePayroll = async (req, res) => {
  try {
    const { month, amount, status, paidDate } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (employee) {
      employee.payroll.push({ month, amount, status, paidDate });
      await employee.save();
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove an employee
// @route   DELETE /api/employees/:id
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
      await employee.deleteOne();
      res.json({ message: 'Employee removed' });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
