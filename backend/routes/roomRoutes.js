const express = require('express');
const router = express.Router();
const { 
  createRoom, 
  getAllRooms, 
  getRoomById, 
  updateRoom, 
  deleteRoom 
} = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route to view rooms
router.get('/', getAllRooms);
router.get('/:id', getRoomById);

// Protected Admin routes
router.post('/', protect, adminOnly, upload.single('image'), createRoom);
router.put('/:id', protect, adminOnly, upload.single('image'), updateRoom);
router.delete('/:id', protect, adminOnly, deleteRoom);

module.exports = router;
