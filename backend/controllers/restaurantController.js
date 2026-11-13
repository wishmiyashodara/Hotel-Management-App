const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// --- MENU OPERATIONS ---

// @desc    Add a new menu item
// @route   POST /api/restaurant/menu
exports.addMenuItem = async (req, res) => {
  try {
    const { itemName, price, category, description } = req.body;
    let image = '';
    
    if (req.file) {
      image = req.file.path.replace(/\\/g, '/');
    }

    const item = await MenuItem.create({
      itemName,
      price,
      category,
      description,
      image
    });
    
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all menu items
// @route   GET /api/restaurant/menu
exports.getMenu = async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/restaurant/menu/:id
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (item) {
      item.name = req.body.name || item.name;
      item.price = req.body.price || item.price;
      item.category = req.body.category || item.category;
      item.description = req.body.description || item.description;
      item.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : item.isAvailable;
      
      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/restaurant/menu/:id
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (item) {
      await item.deleteOne();
      res.json({ message: 'Item removed' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- ORDER OPERATIONS ---

// @desc    Place a food order
// @route   POST /api/restaurant/orders
exports.placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, orderType, roomNumber } = req.body;
    const userId = req.user._id;

    const order = await Order.create({
      userId,
      items,
      totalAmount,
      orderType,
      roomNumber
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get orders (Admin/Staff sees all, Customers see only theirs)
// @route   GET /api/restaurant/orders
exports.getAllOrders = async (req, res) => {
  try {
    let query = {};
    
    // If user is a customer, only show their own orders
    if (req.user.role === 'customer') {
      query = { userId: req.user._id };
    }

    const orders = await Order.find(query)
      .populate('userId', 'name')
      .populate('items.menuItemId')
      .sort({ createdAt: -1 }); // Show newest first
      
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/restaurant/orders/:id
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
