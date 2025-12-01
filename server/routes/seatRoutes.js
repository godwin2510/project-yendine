const express = require('express');
const router = express.Router();
const SeatBooking = require('../models/seatBooking');
const User = require('../models/userModel');
const Razorpay = require('razorpay');

// Test endpoint to verify database connection and SeatBooking model
router.get('/test', async (req, res) => {
  try {
    console.log('=== TESTING SEAT BOOKING SYSTEM ===');
    
    // Check MongoDB connection
    const mongoose = require('mongoose');
    const connectionState = mongoose.connection.readyState;
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    console.log('MongoDB connection state:', connectionState, '(', connectionStates[connectionState], ')');
    
    if (connectionState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'MongoDB not connected',
        connectionState: connectionState,
        connectionStateName: connectionStates[connectionState]
      });
    }
    
    // Test SeatBooking model
    const testBooking = new SeatBooking({
      seatNumber: 999, // Use seat 999 for testing (outside normal range)
      orderId: 'TEST_' + Date.now(),
      userId: 'test@example.com',
      userName: 'Test User',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      paymentVerified: false,
      paymentStatus: 'pending'
    });
    
    console.log('Test booking object created:', testBooking);
    
    // Try to save the test booking
    const savedTestBooking = await testBooking.save();
    console.log('✅ Test booking saved successfully:', savedTestBooking._id);
    
    // Query it back to verify
    const retrievedTestBooking = await SeatBooking.findById(savedTestBooking._id);
    console.log('✅ Test booking retrieved:', retrievedTestBooking ? 'SUCCESS' : 'FAILED');
    
    // Clean up test booking
    await SeatBooking.findByIdAndDelete(savedTestBooking._id);
    console.log('✅ Test booking cleaned up');
    
    // Get current booking count
    const totalBookings = await SeatBooking.countDocuments();
    console.log('Total bookings in database:', totalBookings);
    
    res.json({
      success: true,
      message: 'Seat booking system test completed successfully',
      tests: {
        mongodbConnection: 'PASSED',
        modelCreation: 'PASSED',
        databaseSave: 'PASSED',
        databaseRetrieve: 'PASSED',
        databaseCleanup: 'PASSED'
      },
      connectionState: connectionState,
      connectionStateName: connectionStates[connectionState],
      totalBookings,
      timestamp: new Date().toISOString()
    });
    
    console.log('=== TEST COMPLETED SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Seat booking system test failed',
      error: error.message,
      errorType: error.name,
      stack: error.stack
    });
  }
});

// Initialize Razorpay with test keys
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  // Use test keys if environment variables are not set
  razorpay = new Razorpay({
    key_id: 'rzp_test_R9Gsfwn9dWKpPN',
    key_secret: 'jEQ0qUumMXfWmdfzkCvpGA0T',
  });
  console.log('Using Razorpay test keys for seat booking');
}

// Verify Razorpay payment signature
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const text = orderId + '|' + paymentId;
    const generatedSignature = require('crypto')
      .createHmac('sha256', razorpay.key_secret)
      .update(text)
      .digest('hex');
    
    return generatedSignature === signature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
};

// Get all seat status (available/occupied)
router.get('/status', async (req, res) => {
  try {
    // Clean expired bookings first
    await SeatBooking.cleanExpiredBookings();
    
    // Only verified & completed payments block seats
    const activeBookings = await SeatBooking.find({
      status: 'active',
      expiresAt: { $gt: new Date() },
      paymentVerified: true,
      paymentStatus: 'completed'
    });
    const bookedSeats = activeBookings.map(booking => booking.seatNumber);
    
    // Create seat status array
    const seatStatus = Array.from({ length: 100 }, (_, i) => {
      const seatNumber = i + 1;
      const booking = activeBookings.find(b => b.seatNumber === seatNumber);
      
      return {
        seatNumber,
        status: booking ? 'occupied' : 'available',
        booking: booking ? {
          orderId: booking.orderId,
          userName: booking.userName,
          bookedAt: booking.bookedAt,
          expiresAt: booking.expiresAt,
          timeRemaining: Math.max(0, Math.floor((booking.expiresAt - new Date()) / 1000 / 60)),
          paymentVerified: booking.paymentVerified,
          paymentStatus: booking.paymentStatus
        } : null
      };
    });
    
    res.json({
      success: true,
      seats: seatStatus,
      totalSeats: 100,
      availableSeats: 100 - bookedSeats.length,
      occupiedSeats: bookedSeats.length
    });
  } catch (error) {
    console.error('Error getting seat status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get seat status',
      error: error.message
    });
  }
});

// Get available seats only
router.get('/available', async (req, res) => {
  try {
    // Clean expired bookings first
    await SeatBooking.cleanExpiredBookings();
    
    // Only verified & completed payments block seats
    const activeBookings = await SeatBooking.find({
      status: 'active',
      expiresAt: { $gt: new Date() },
      paymentVerified: true,
      paymentStatus: 'completed'
    });
    const bookedSeats = new Set(activeBookings.map(b => b.seatNumber));
    const availableSeats = Array.from({ length: 100 }, (_, i) => i + 1).filter(n => !bookedSeats.has(n));
    
    res.json({
      success: true,
      availableSeats,
      count: availableSeats.length
    });
  } catch (error) {
    console.error('Error getting available seats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available seats',
      error: error.message
    });
  }
});

// NEW: Book seats after successful payment verification
router.post('/book-after-payment', async (req, res) => {
  try {
    console.log('=== PAYMENT-BASED BOOKING REQUEST START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { 
      seats, 
      orderId, 
      userId, 
      userName, 
      orderDetails,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = req.body;

    // console.log('Booking request received:', req.body);
    
    // Validate required fields
    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      console.log('❌ Invalid seats data:', seats);
      return res.status(400).json({
        success: false,
        message: 'Seats array is required'
      });
    }
    
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      console.log('❌ Missing required fields:', { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature });
      return res.status(400).json({
        success: false,
        message: 'Order ID, Razorpay order ID, payment ID, and signature are required'
      });
    }
    
    console.log('✅ Validating Razorpay payment signature...');
    
    // Verify Razorpay payment signature
    if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      console.log('❌ Invalid payment signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.'
      });
    }
    
    console.log('✅ Payment signature verified. Checking Razorpay API...');
    
    // Verify payment with Razorpay API
    try {
      const payment = await razorpay.payments.fetch(razorpayPaymentId);
      
      if (payment.status !== 'captured') {
        console.log('❌ Payment not completed. Status:', payment.status);
        return res.status(400).json({
          success: false,
          message: 'Payment not completed. Current status: ' + payment.status
        });
      }
      
      if (payment.order_id !== razorpayOrderId) {
        console.log('❌ Payment order ID mismatch');
        return res.status(400).json({
          success: false,
          message: 'Payment order ID mismatch'
        });
      }
      
      console.log('✅ Payment verified successfully:', {
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId,
        status: payment.status,
        amount: payment.amount
      });
      
    } catch (razorpayError) {
      console.error('❌ Error verifying payment with Razorpay:', razorpayError);
      return res.status(400).json({
        success: false,
        message: 'Failed to verify payment with Razorpay'
      });
    }
    
    console.log('✅ Starting database transaction...');
    
    // ENHANCED: Use database transaction to prevent race conditions
    const session = await SeatBooking.startSession();
    session.startTransaction();
    
    try {
      // Clean expired bookings first
      await SeatBooking.cleanExpiredBookings();
      
      // DOUBLE-CHECK: Verify seats are still available within transaction
      const activeBookings = await SeatBooking.find({
        status: 'active',
        expiresAt: { $gt: new Date() },
        paymentVerified: true,
        paymentStatus: 'completed'
      }).session(session);
      
      const bookedSeats = activeBookings.map(booking => booking.seatNumber);
      const unavailableSeats = seats.filter(seat => bookedSeats.includes(seat));
      
      if (unavailableSeats.length > 0) {
        console.log('❌ Seats no longer available:', unavailableSeats);
        await session.abortTransaction();
        return res.status(409).json({
          success: false,
          message: 'Some seats are no longer available. Please refresh and try again.',
          unavailableSeats,
          errorCode: 'SEATS_TAKEN'
        });
      }
      
      // Fetch user information if userId is provided
      let actualUserName = userName;
      if (userId) {
        try {
          // Try to find user by email (userId in this case is the email)
          const user = await User.findOne({ email: userId });
          if (user && user.name) {
            actualUserName = user.name;
            console.log('✅ Found user:', user.name);
          }
        } catch (userError) {
          console.log('⚠️ Could not fetch user info:', userError.message);
        }
      }
      
      // Calculate expiration time (30 minutes from now)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      
      // Create bookings for all requested seats with payment verification
      const bookings = seats.map(seatNumber => ({
        seatNumber,
        orderId,
        userId: userId || null,
        userName: actualUserName || 'Guest User',
        expiresAt,
        orderDetails: orderDetails || null,
        paymentVerified: true,
        razorpayOrderId,
        razorpayPaymentId,
        paymentStatus: 'completed',
        bookedAt: new Date()
      }));
      
      console.log('📝 Creating verified bookings with data:', JSON.stringify(bookings, null, 2));
      
      // Verify MongoDB connection before insert
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        console.log('❌ MongoDB not connected. Connection state:', mongoose.connection.readyState);
        await session.abortTransaction();
        return res.status(500).json({
          success: false,
          message: 'Database connection not available'
        });
      }
      
      console.log('✅ MongoDB connection verified. Ready state:', mongoose.connection.readyState);
      
      const createdBookings = await SeatBooking.insertMany(bookings, { session });
      
      // Commit the transaction
      await session.commitTransaction();
      
      console.log('✅ Seats booked successfully after payment verification:', {
        orderId,
        seats,
        paymentId: razorpayPaymentId,
        bookingsCount: createdBookings.length,
        expiresAt
      });
      
      // Verify the bookings were actually saved by querying them back
      const savedBookings = await SeatBooking.find({ orderId });
      console.log('🔍 Verification - Found saved bookings:', savedBookings.length);
      
      res.status(201).json({
        success: true,
        message: 'Seats booked successfully after payment verification',
        bookings: createdBookings,
        expiresAt,
        timeRemaining: 30, // minutes
        paymentVerified: true,
        razorpayOrderId,
        razorpayPaymentId,
        seatProtection: '30 minutes'
      });
      
      console.log('=== PAYMENT-BASED BOOKING REQUEST COMPLETED ===');
      
    } catch (error) {
      // Rollback transaction on error
      console.error('❌ Transaction error, rolling back:', error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
    
  } catch (error) {
    console.error('❌ Error booking seats after payment:', error);
    console.error('Error stack:', error.stack);
    
    // Check if it's a MongoDB connection error
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      console.error('❌ MongoDB connection error detected');
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to book seats after payment verification',
      error: error.message,
      errorType: error.name
    });
  }
});

// NEW: Book seats for cash payments (no payment verification required)
router.post('/book-cash', async (req, res) => {
  try {
    console.log('=== CASH BOOKING REQUEST START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { seats, orderId, userId, userName, orderDetails } = req.body;
    
    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      console.log('❌ Invalid seats data:', seats);
      return res.status(400).json({
        success: false,
        message: 'Seats array is required'
      });
    }
    
    if (!orderId) {
      console.log('❌ Missing orderId');
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }
    
    console.log('✅ Processing cash booking for seats:', seats, 'orderId:', orderId);
    
    // Check seat availability
    const unavailableSeats = [];
    for (const seatNumber of seats) {
      const existingBooking = await SeatBooking.findOne({
        seatNumber,
        status: 'active',
        expiresAt: { $gt: new Date() }
      });
      
      if (existingBooking) {
        console.log(`❌ Seat ${seatNumber} is already booked:`, existingBooking);
        unavailableSeats.push(seatNumber);
      }
    }
    
    if (unavailableSeats.length > 0) {
      console.log('❌ Unavailable seats:', unavailableSeats);
      return res.status(400).json({
        success: false,
        message: 'Some seats are no longer available. Please refresh and try again.',
        unavailableSeats,
        errorCode: 'SEATS_TAKEN'
      });
    }
    
    // Fetch user information if userId is provided
    let actualUserName = userName;
    if (userId) {
      try {
        const user = await User.findOne({ email: userId });
        if (user && user.name) {
          actualUserName = user.name;
          console.log('✅ Found user:', user.name);
        }
      } catch (userError) {
        console.log('⚠️ Could not fetch user info:', userError.message);
      }
    }
    
    // Calculate expiration time (30 minutes from now)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    
    // Create bookings for all requested seats (cash payment - no verification required)
    const bookings = seats.map(seatNumber => ({
      seatNumber,
      orderId,
      userId: userId || null,
      userName: actualUserName || 'Guest User',
      expiresAt,
      orderDetails: orderDetails || null,
      paymentVerified: false, // Cash payment - not verified
      paymentStatus: 'pending', // Cash payment - pending until cash is received
      bookedAt: new Date()
    }));
    
    console.log('📝 Creating bookings with data:', JSON.stringify(bookings, null, 2));
    
    // Verify MongoDB connection before insert
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ MongoDB not connected. Connection state:', mongoose.connection.readyState);
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      });
    }
    
    console.log('✅ MongoDB connection verified. Ready state:', mongoose.connection.readyState);
    
    const createdBookings = await SeatBooking.insertMany(bookings);
    
    console.log('✅ Seats booked successfully for cash payment:', {
      orderId,
      seats,
      bookingsCount: createdBookings.length,
      expiresAt,
      createdBookings: createdBookings.map(b => ({ seatNumber: b.seatNumber, _id: b._id }))
    });
    
    // Verify the bookings were actually saved by querying them back
    const savedBookings = await SeatBooking.find({ orderId });
    console.log('🔍 Verification - Found saved bookings:', savedBookings.length);
    
    res.status(201).json({
      success: true,
      message: 'Seats booked successfully for cash payment',
      bookings: createdBookings,
      expiresAt,
      timeRemaining: 30, // minutes
      paymentVerified: false,
      paymentStatus: 'pending',
      seatProtection: '30 minutes'
    });
    
    console.log('=== CASH BOOKING REQUEST COMPLETED ===');
    
  } catch (error) {
    console.error('❌ Error booking seats for cash payment:', error);
    console.error('Error stack:', error.stack);
    
    // Check if it's a MongoDB connection error
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      console.error('❌ MongoDB connection error detected');
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to book seats for cash payment',
      error: error.message,
      errorType: error.name
    });
  }
});

// DEPRECATED: Old booking endpoint - now redirects to payment-first approach
router.post('/book', async (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Direct seat booking is not allowed. Please complete payment first and use /book-after-payment endpoint.',
    redirectTo: '/book-after-payment',
    requiredFields: ['seats', 'orderId', 'razorpayOrderId', 'razorpayPaymentId', 'razorpaySignature']
  });
});

// Cancel seat booking
router.delete('/cancel/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const result = await SeatBooking.updateMany(
      { orderId, status: 'active' },
      { $set: { status: 'expired' } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active bookings found for this order'
      });
    }
    
    res.json({
      success: true,
      message: 'Seat bookings cancelled successfully',
      cancelledCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error cancelling seat booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel seat booking',
      error: error.message
    });
  }
});

// Extend booking time (admin function)
router.patch('/extend/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { additionalMinutes = 15 } = req.body;
    
    const bookings = await SeatBooking.find({ orderId, status: 'active' });
    
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active bookings found for this order'
      });
    }
    
    // Extend expiration time for all bookings of this order
    const newExpiresAt = new Date(Date.now() + additionalMinutes * 60 * 1000);
    
    await SeatBooking.updateMany(
      { orderId, status: 'active' },
      { $set: { expiresAt: newExpiresAt } }
    );
    
    res.json({
      success: true,
      message: 'Booking time extended successfully',
      newExpiresAt,
      extendedMinutes: additionalMinutes
    });
  } catch (error) {
    console.error('Error extending booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extend booking',
      error: error.message
    });
  }
});

// Get booking details by order ID
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const bookings = await SeatBooking.find({ orderId }).sort({ seatNumber: 1 });
    
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No bookings found for this order'
      });
    }
    
    res.json({
      success: true,
      orderId,
      bookings,
      totalSeats: bookings.length,
      status: bookings[0].status
    });
  } catch (error) {
    console.error('Error getting booking details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking details',
      error: error.message
    });
  }
});

// Admin: Get all bookings (for admin dashboard)
router.get('/admin/all', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status) {
      switch (status) {
        case 'payment-verified':
          query = { paymentVerified: true, paymentStatus: 'completed' };
          break;
        case 'pending-payment':
          query = { paymentVerified: false, status: 'active' };
          break;
        case 'cash-bookings':
          query = { paymentVerified: false, status: 'active', paymentStatus: 'pending' };
          break;
        case 'temporary':
          query = { isTemporary: true, status: 'active' };
          break;
        default:
          query.status = status;
      }
    }
    
    const bookings = await SeatBooking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Populate user information for bookings with userId
    const populatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const bookingObj = booking.toObject();
        
        console.log('Processing booking:', {
          orderId: bookingObj.orderId,
          userId: bookingObj.userId,
          userName: bookingObj.userName
        });
        
        // If there's a userId, try to fetch the user's name (even if userName exists)
        if (bookingObj.userId) {
          try {
            // Try to find user by email (userId in this case is the email)
            const user = await User.findOne({ email: bookingObj.userId });
            if (user && user.name) {
              bookingObj.userName = user.name;
              console.log('Found user for booking:', user.name);
            } else {
              console.log('No user found for email:', bookingObj.userId);
            }
          } catch (userError) {
            console.log('Could not fetch user info for booking:', userError.message);
          }
        } else {
          console.log('No userId found for booking:', bookingObj.orderId);
        }
        
        return bookingObj;
      })
    );
    
    const total = await SeatBooking.countDocuments(query);
    
    res.json({
      success: true,
      bookings: populatedBookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting all bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
      error: error.message
    });
  }
});

// Admin: Get booking statistics
router.get('/admin/stats', async (req, res) => {
  try {
    const totalBookings = await SeatBooking.countDocuments();
    const activeBookings = await SeatBooking.countDocuments({ status: 'active' });
    const expiredBookings = await SeatBooking.countDocuments({ status: 'expired' });
    const completedBookings = await SeatBooking.countDocuments({ status: 'completed' });
    
    // NEW: Payment verification statistics
    const paymentVerifiedBookings = await SeatBooking.countDocuments({ 
      paymentVerified: true, 
      paymentStatus: 'completed' 
    });
    const pendingPaymentBookings = await SeatBooking.countDocuments({ 
      paymentVerified: false, 
      status: 'active',
      paymentStatus: 'pending'
    });
    const cashBookings = await SeatBooking.countDocuments({
      paymentVerified: false,
      status: 'active',
      paymentStatus: 'pending'
    });
    const temporaryReservations = await SeatBooking.countDocuments({ 
      isTemporary: true, 
      status: 'active' 
    });
    
    // Get recent activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentBookings = await SeatBooking.countDocuments({
      createdAt: { $gte: yesterday }
    });
    
    res.json({
      success: true,
      stats: {
        total: totalBookings,
        active: activeBookings,
        expired: expiredBookings,
        completed: completedBookings,
        recent24h: recentBookings,
        // NEW: Payment verification stats
        paymentVerified: paymentVerifiedBookings,
        pendingPayment: pendingPaymentBookings,
        cashBookings: cashBookings,
        temporaryReservations: temporaryReservations
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting booking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking statistics',
      error: error.message
    });
  }
});

// Admin: Force expire bookings for an order
router.post('/admin/expire/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const result = await SeatBooking.updateMany(
      { orderId, status: 'active' },
      { $set: { status: 'expired' } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active bookings found for this order'
      });
    }
    
    res.json({
      success: true,
      message: 'Bookings expired successfully',
      expiredCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error expiring bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to expire bookings',
      error: error.message
    });
  }
});

// Admin: Update existing bookings with user information
router.post('/admin/update-user-info', async (req, res) => {
  try {
    // First, let's check what users we have in the database
    const allUsers = await User.find({});
    console.log('All users in database:', allUsers.map(u => ({ email: u.email, name: u.name })));
    
    // Get all bookings that have "Guest User" as userName
    const guestBookings = await SeatBooking.find({ userName: 'Guest User' });
    
    console.log(`Found ${guestBookings.length} bookings with Guest User`);
    console.log('Guest bookings details:', guestBookings.map(b => ({ 
      orderId: b.orderId, 
      userId: b.userId, 
      userName: b.userName 
    })));
    
    let updatedCount = 0;
    
    for (const booking of guestBookings) {
      if (booking.userId) {
        try {
          // Try to find user by email
          const user = await User.findOne({ email: booking.userId });
          if (user && user.name) {
            // Update the booking with the real user name
            await SeatBooking.findByIdAndUpdate(booking._id, {
              userName: user.name
            });
            updatedCount++;
            console.log(`Updated booking ${booking.orderId} with user: ${user.name}`);
          } else {
            console.log(`No user found for email: ${booking.userId}`);
          }
        } catch (userError) {
          console.log('Could not fetch user info for booking:', userError.message);
        }
      } else {
        console.log(`No userId found for booking: ${booking.orderId}`);
      }
    }
    
    res.json({
      success: true,
      message: `Updated ${updatedCount} bookings with real user names`,
      totalGuestBookings: guestBookings.length,
      updatedCount,
      totalUsers: allUsers.length
    });
  } catch (error) {
    console.error('Error updating user info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user information',
      error: error.message
    });
  }
});

// Admin: Create a test user (for testing purposes)
router.post('/admin/create-test-user', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        success: true,
        message: 'User already exists',
        user: existingUser
      });
    }
    
    // Create new user
    const newUser = new User({
      email,
      name,
      image: 'https://via.placeholder.com/150'
    });
    
    await newUser.save();
    
    res.json({
      success: true,
      message: 'Test user created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test user',
      error: error.message
    });
  }
});

// NEW: Check payment status for an order
router.get('/payment-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const bookings = await SeatBooking.find({ orderId }).sort({ seatNumber: 1 });
    
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No bookings found for this order'
      });
    }
    
    const firstBooking = bookings[0];
    const paymentStatus = {
      orderId,
      paymentVerified: firstBooking.paymentVerified || false,
      paymentStatus: firstBooking.paymentStatus || 'pending',
      razorpayOrderId: firstBooking.razorpayOrderId,
      razorpayPaymentId: firstBooking.razorpayPaymentId,
      totalSeats: bookings.length,
      seats: bookings.map(b => b.seatNumber),
      status: firstBooking.status
    };
    
    res.json({
      success: true,
      paymentStatus
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
});

// NEW: Reserve seats temporarily during payment processing (optional)
router.post('/reserve-temp', async (req, res) => {
  try {
    const { seats, orderId, userId, userName, orderDetails } = req.body;
    
    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Seats array is required'
      });
    }
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }
    
    // ENHANCED: Use database transaction to prevent race conditions
    const session = await SeatBooking.startSession();
    session.startTransaction();
    
    try {
      // Clean expired bookings first
      await SeatBooking.cleanExpiredBookings();
      
      // DOUBLE-CHECK: Verify seats are still available within transaction
      const activeBookings = await SeatBooking.find({
        status: 'active',
        expiresAt: { $gt: new Date() },
        $or: [
          { paymentVerified: true, paymentStatus: 'completed' },
          { isTemporary: true }
        ]
      }).session(session);
      
      const bookedSeats = activeBookings.map(booking => booking.seatNumber);
      const unavailableSeats = seats.filter(seat => bookedSeats.includes(seat));
      
      if (unavailableSeats.length > 0) {
        await session.abortTransaction();
        return res.status(409).json({
          success: false,
          message: 'Some seats are no longer available. Please refresh and try again.',
          unavailableSeats,
          errorCode: 'SEATS_TAKEN'
        });
      }
      
      // Create temporary reservation (5 minutes expiry)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      const tempReservations = seats.map(seatNumber => ({
        seatNumber,
        orderId,
        userId: userId || null,
        userName: userName || 'Guest User',
        expiresAt,
        orderDetails: orderDetails || null,
        paymentVerified: false,
        paymentStatus: 'pending',
        status: 'active',
        isTemporary: true
      }));
      
      const createdReservations = await SeatBooking.insertMany(tempReservations, { session });
      
      // Commit the transaction
      await session.commitTransaction();
      
      console.log('Temporary seat reservations created:', {
        orderId,
        seats,
        reservationsCount: createdReservations.length,
        expiresAt
      });
      
      res.status(201).json({
        success: true,
        message: 'Temporary seat reservations created. Complete payment within 5 minutes to confirm.',
        reservations: createdReservations,
        expiresAt,
        timeRemaining: 5, // minutes
        paymentVerified: false,
        isTemporary: true,
        seatProtection: '5 minutes (temporary)'
      });
      
    } catch (error) {
      // Rollback transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
    
  } catch (error) {
    console.error('Error creating temporary reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create temporary reservations',
      error: error.message
    });
  }
});

// NEW: Convert temporary reservations to confirmed bookings after payment
router.post('/confirm-reservations', async (req, res) => {
  try {
    const { 
      orderId, 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature 
    } = req.body;
    
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Razorpay order ID, payment ID, and signature are required'
      });
    }
    
    // Verify Razorpay payment signature
    if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.'
      });
    }
    
    // Verify payment with Razorpay API
    try {
      const payment = await razorpay.payments.fetch(razorpayPaymentId);
      
      if (payment.status !== 'captured') {
        return res.status(400).json({
          success: false,
          message: 'Payment not completed. Current status: ' + payment.status
        });
      }
      
      if (payment.order_id !== razorpayOrderId) {
        return res.status(400).json({
          success: false,
          message: 'Payment order ID mismatch'
        });
      }
      
      console.log('Payment verified for reservation confirmation:', {
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId,
        status: payment.status
      });
      
    } catch (razorpayError) {
      console.error('Error verifying payment with Razorpay:', razorpayError);
      return res.status(400).json({
        success: false,
        message: 'Failed to verify payment with Razorpay'
      });
    }
    
    // Find and update temporary reservations
    const result = await SeatBooking.updateMany(
      { 
        orderId, 
        isTemporary: true,
        status: 'active'
      },
      { 
        $set: { 
          paymentVerified: true,
          paymentStatus: 'completed',
          razorpayOrderId,
          razorpayPaymentId,
          isTemporary: false,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000) // Extend to 30 minutes
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No temporary reservations found for this order'
      });
    }
    
    console.log('Temporary reservations confirmed after payment:', {
      orderId,
      confirmedCount: result.modifiedCount,
      paymentId: razorpayPaymentId
    });
    
    res.json({
      success: true,
      message: 'Temporary reservations confirmed successfully after payment',
      confirmedCount: result.modifiedCount,
      paymentVerified: true,
      razorpayOrderId,
      razorpayPaymentId,
      newExpiresAt: new Date(Date.now() + 30 * 60 * 1000)
    });
  } catch (error) {
    console.error('Error confirming reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm reservations',
      error: error.message
    });
  }
});

// NEW: Get real-time seat protection status
router.get('/protection-status', async (req, res) => {
  try {
    // Clean expired bookings first
    await SeatBooking.cleanExpiredBookings();
    
    // Get all active bookings (both confirmed and temporary)
    const activeBookings = await SeatBooking.find({
      status: 'active',
      expiresAt: { $gt: new Date() }
    }).sort({ seatNumber: 1 });
    
    // Create detailed protection status
    const protectionStatus = Array.from({ length: 100 }, (_, i) => {
      const seatNumber = i + 1;
      const booking = activeBookings.find(b => b.seatNumber === seatNumber);
      
      if (!booking) {
        return {
          seatNumber,
          status: 'available',
          protected: false,
          protectionType: null,
          timeRemaining: null,
          bookedBy: null,
          orderId: null
        };
      }
      
      const now = new Date();
      const timeRemaining = Math.max(0, Math.floor((booking.expiresAt - now) / 1000 / 60)); // minutes
      
      return {
        seatNumber,
        status: 'protected',
        protected: true,
        protectionType: booking.isTemporary ? 'temporary' : 'confirmed',
        timeRemaining,
        timeRemainingFormatted: `${Math.floor(timeRemaining / 60)}h ${timeRemaining % 60}m`,
        bookedBy: booking.userName || 'Guest User',
        orderId: booking.orderId,
        paymentVerified: booking.paymentVerified,
        paymentStatus: booking.paymentStatus,
        expiresAt: booking.expiresAt,
        isTemporary: booking.isTemporary
      };
    });
    
    const protectedSeats = protectionStatus.filter(seat => seat.protected);
    const availableSeats = protectionStatus.filter(seat => !seat.protected);
    
    res.json({
      success: true,
      protectionStatus,
      summary: {
        totalSeats: 100,
        protectedSeats: protectedSeats.length,
        availableSeats: availableSeats.length,
        confirmedBookings: protectedSeats.filter(seat => !seat.isTemporary).length,
        temporaryReservations: protectedSeats.filter(seat => seat.isTemporary).length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting protection status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get seat protection status',
      error: error.message
    });
  }
});

module.exports = router;
