const Room = require('../models/Room');
const Booking = require('../models/Booking');

// @desc    Create a new room
// @route   POST /api/rooms
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, pricePerNight, capacity, description } = req.body;
    
    // Member 1 Logic: Image path from Multer
    const image = req.file ? req.file.path : '';

    const room = await Room.create({
      roomNumber,
      roomType,
      pricePerNight,
      capacity,
      description,
      image
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all rooms
// @route   GET /api/rooms
exports.getAllRooms = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    const rooms = await Room.find().lean();

    if (checkIn && checkOut) {
      // Normalize search dates to start of day UTC
      const start = new Date(checkIn);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(checkOut);
      end.setUTCHours(0, 0, 0, 0);

      const bookings = await Booking.find({
        status: { $in: ['Approved', 'Pending'] },
        checkInDate: { $lt: end },
        checkOutDate: { $gt: start }
      }).select('roomId');

      const occupiedRoomIds = bookings.map(b => b.roomId.toString());

      const roomsWithAvailability = rooms.map(room => {
        const isOccupied = occupiedRoomIds.includes(room._id.toString());
        const isUnderMaintenance = room.availabilityStatus === 'Maintenance';
        
        return {
          ...room,
          isAvailable: !isOccupied && !isUnderMaintenance,
          reason: isUnderMaintenance ? 'Maintenance' : (isOccupied ? 'Occupied' : 'Available')
        };
      });

      return res.json(roomsWithAvailability);
    }

    res.json(rooms.map(r => ({ ...r, isAvailable: r.availabilityStatus === 'Available' })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a room
// @route   PUT /api/rooms/:id
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (room) {
      room.roomNumber = req.body.roomNumber || room.roomNumber;
      room.roomType = req.body.roomType || room.roomType;
      room.pricePerNight = req.body.pricePerNight || room.pricePerNight;
      room.capacity = req.body.capacity || room.capacity;
      room.description = req.body.description || room.description;
      room.availabilityStatus = req.body.availabilityStatus || room.availabilityStatus;
      
      if (req.file) {
        room.image = req.file.path;
      }

      const updatedRoom = await room.save();
      res.json(updatedRoom);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (room) {
      await room.deleteOne();
      res.json({ message: 'Room removed' });
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
