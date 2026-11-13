const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  addMenuItem,
  getMenu,
  placeOrder,
  getAllOrders,
  updateOrderStatus,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/restaurantController');
const { protect, adminOnly, adminOrStaff } = require('../middleware/authMiddleware');

// Configure Multer for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `menu-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Menu routes
router.get('/menu', getMenu);
router.post('/menu', protect, adminOnly, upload.single('image'), addMenuItem);
router.put('/menu/:id', protect, adminOnly, upload.single('image'), updateMenuItem);
router.delete('/menu/:id', protect, adminOnly, deleteMenuItem);

// Order routes
router.post('/orders', protect, placeOrder);
router.get('/orders', protect, getAllOrders);
router.put('/orders/:id', protect, adminOrStaff, updateOrderStatus);

module.exports = router;
