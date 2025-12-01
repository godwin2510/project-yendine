const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const AutoSeatBlockingService = require('../services/autoSeatBlocking');

// Create a new order
router.post('/create', async (req, res) => {
  try {
    const {
      userId,
      userName,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus,
      razorpayOrderId,
      razorpayPaymentId,
      selectedSeats,
      orderNotes
    } = req.body;

    if (!userId || !userName || !items || !totalAmount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create new order
    const order = new Order({
      userId,
      userName,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentStatus || 'pending',
      razorpayOrderId,
      razorpayPaymentId,
      selectedSeats: selectedSeats || [],
      orderNotes,
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    });

    await order.save();
    console.log('Order created successfully:', order);

    // Auto-block seats if orderNotes contains seat information
    let seatBlockingResult = null;
    if (orderNotes && orderNotes.includes('Seats booked:')) {
      try {
        console.log('🔄 Auto-blocking seats for order:', order._id);
        seatBlockingResult = await AutoSeatBlockingService.blockSeatsForOrder(
          order._id.toString(),
          userId,
          userName,
          orderNotes
        );
        console.log('✅ Seat blocking result:', seatBlockingResult);
      } catch (seatError) {
        console.error('❌ Error auto-blocking seats:', seatError);
        // Don't fail the order creation if seat blocking fails
        seatBlockingResult = {
          success: false,
          error: seatError.message
        };
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: order,
      seatBlocking: seatBlockingResult
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Get all orders (for admin)
router.get('/admin/all', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Get orders for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders',
      error: error.message
    });
  }
});

// Update order status
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// Update payment status
router.patch('/:orderId/payment-status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Payment status is required'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      order: order
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
});

// Get order statistics (for admin)
router.get('/admin/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const preparingOrders = await Order.countDocuments({ status: 'preparing' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        preparingOrders,
        completedOrders,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
});

// NEW: Manually trigger seat blocking for an existing order
router.post('/:orderId/block-seats', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order has seat information
    if (!order.orderNotes || !order.orderNotes.includes('Seats booked:')) {
      return res.status(400).json({
        success: false,
        message: 'Order does not contain seat information'
      });
    }

    // Check if seats are already blocked
    const existingBookings = await require('../models/seatBooking').find({ orderId });
    if (existingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Seats are already blocked for this order',
        existingBookings: existingBookings.length
      });
    }

    // Block seats
    const seatBlockingResult = await AutoSeatBlockingService.blockSeatsForOrder(
      orderId,
      order.userId,
      order.userName,
      order.orderNotes
    );

    res.json({
      success: true,
      message: 'Seats blocked successfully',
      orderId,
      seatBlocking: seatBlockingResult
    });

  } catch (error) {
    console.error('Error manually blocking seats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block seats',
      error: error.message
    });
  }
});

// NEW: Get seat blocking status for an order
router.get('/:orderId/seats', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const seatStatus = await AutoSeatBlockingService.getBlockedSeats(orderId);
    
    res.json(seatStatus);

  } catch (error) {
    console.error('Error getting seat status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get seat status',
      error: error.message
    });
  }
});

// NEW: Force expire seats for an order (admin function)
router.post('/:orderId/expire-seats', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const result = await AutoSeatBlockingService.forceExpireSeats(orderId);
    
    res.json(result);

  } catch (error) {
    console.error('Error force expiring seats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to force expire seats',
      error: error.message
    });
  }
});

module.exports = router;
