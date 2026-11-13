const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Order = require('../models/Order');
const { sendEmail } = require('../utils/emailService');

// @desc    Create a new booking request
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, totalPrice } = req.body;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    if (room.availabilityStatus === 'Maintenance') {
      return res.status(400).json({ message: 'Room is currently under maintenance' });
    }

    // Normalize to exact start of day UTC
    const start = new Date(checkInDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(checkOutDate);
    end.setUTCHours(0, 0, 0, 0);

    console.log(`Checking availability for Room: ${roomId} from ${start} to ${end}`);

    // 2. Iron-Clad Overlap Logic: (newCheckIn < existingCheckOut) AND (newCheckOut > existingIn)
    const overlappingBooking = await Booking.findOne({
      roomId: roomId,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        {
          checkInDate: { $lt: end },
          checkOutDate: { $gt: start }
        }
      ]
    });

    if (overlappingBooking) {
      console.log('Blocking booking: Overlap found with ID:', overlappingBooking._id);
      return res.status(400).json({ message: 'Room not available for selected dates' });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      roomId,
      checkInDate: start,
      checkOutDate: end,
      totalPrice,
      status: 'Pending'
    });

    // SEND EMAIL: Booking Received
    await sendEmail(
      req.user.email,
      'Reservation Received - Coconut Republik',
      'Your Island Escape Awaits!',
      'We have received your booking request. Our team is currently reviewing it and will send you a confirmation shortly.',
      { ...booking.toObject(), customerName: req.user.name, totalAmount: totalPrice }
    );

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('roomId', 'roomNumber roomType pricePerNight');
    
    // Enrich with restaurant orders
    const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
      const rNum = booking.roomId?.roomNumber ? String(booking.roomId.roomNumber).trim() : '';
      const bUserId = booking.userId?._id || booking.userId;

      const orders = await Order.find({
        userId: bUserId,
        roomNumber: rNum
      });
      const orderTotal = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      return {
        ...booking.toObject(),
        orderTotal,
        grandTotal: booking.totalPrice + orderTotal
      };
    }));

    res.json(enrichedBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's booking history
// @route   GET /api/bookings/mybookings
exports.getMyBookings = async (req, res) => {
  try {
    // 1. Fetch real bookings
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('roomId', 'roomNumber roomType pricePerNight');
    
    // 2. Fetch standalone orders (Takeaway/Table Reservations)
    // We should only fetch orders that aren't already paid for. 
    // Since our Order model doesn't have a paymentStatus yet, we fetch all orders with roomNumber 'N/A'
    const standaloneOrders = await Order.find({
      userId: req.user._id,
      roomNumber: 'N/A'
    }).populate('items.menuItemId');

    const standaloneTotal = standaloneOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // 3. Enrich real bookings with their specific room service orders
    const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
      const rNum = booking.roomId?.roomNumber ? String(booking.roomId.roomNumber).trim() : '';
      const orders = await Order.find({
        userId: req.user._id,
        roomNumber: rNum
      });
      const orderTotal = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      // We bundle standalone orders into the FIRST approved booking found
      return {
        ...booking.toObject(),
        orderTotal: orderTotal,
        grandTotal: booking.totalPrice + orderTotal
      };
    }));

    // 4. Always add a virtual entry for standalone dining if orders exist
    // This ensures Takeaway and Table Reservations are ALWAYS payable
    if (standaloneTotal > 0) {
      enrichedBookings.push({
        _id: 'standalone_dining',
        status: 'Approved', // Always 'Approved' so it shows in the Payment list
        paymentStatus: 'Unpaid',
        roomId: { roomNumber: 'Dining Hub 🥡' },
        totalPrice: 0,
        orderTotal: standaloneTotal,
        grandTotal: standaloneTotal,
        virtual: true
      });
    }

    res.json(enrichedBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (Admin Only: Approve/Reject)
// @route   PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      // Update booking status
      booking.status = status;
      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cancel a booking
// @route   DELETE /api/bookings/:id
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (booking) {
      if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      booking.status = 'Cancelled';
      await booking.save();
      res.json({ message: 'Booking cancelled' });
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Hard delete a booking (Admin Only)
// @route   DELETE /api/bookings/:id/hard
exports.hardDeleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    await booking.deleteOne();
    res.json({ message: 'Booking record permanently removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
