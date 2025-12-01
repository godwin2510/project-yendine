const SeatBooking = require('../models/seatBooking');

// Function to clean expired bookings
async function cleanExpiredBookings() {
  try {
    // Get count of bookings that will expire
    const expiringBookings = await SeatBooking.countDocuments({
      status: 'active',
      expiresAt: { $lte: new Date() }
    });
    
    if (expiringBookings > 0) {
      console.log(`🔄 Found ${expiringBookings} expired bookings to clean up`);
      
      // Get details of expiring bookings for logging
      const expiringDetails = await SeatBooking.find({
        status: 'active',
        expiresAt: { $lte: new Date() }
      }).select('seatNumber orderId orderDetails expiresAt');
      
      expiringDetails.forEach(booking => {
        const source = booking.orderDetails?.source || 'unknown';
        const type = booking.orderDetails?.type || 'unknown';
        console.log(`⏰ Expiring seat ${booking.seatNumber} from order ${booking.orderId} (${source}/${type})`);
      });
    }
    
    const result = await SeatBooking.cleanExpiredBookings();
    console.log(`✅ Cleaned ${result.modifiedCount} expired bookings at ${new Date().toISOString()}`);
    
    // Also clean expired temporary reservations
    const tempResult = await SeatBooking.cleanExpiredTempReservations();
    if (tempResult.modifiedCount > 0) {
      console.log(`🧹 Cleaned ${tempResult.modifiedCount} expired temporary reservations`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error cleaning expired bookings:', error);
    throw error;
  }
}

// Function to get booking statistics
async function getBookingStats() {
  try {
    const totalBookings = await SeatBooking.countDocuments();
    const activeBookings = await SeatBooking.countDocuments({ status: 'active' });
    const expiredBookings = await SeatBooking.countDocuments({ status: 'expired' });
    
    // Get auto-blocked seat statistics
    const autoBlockedBookings = await SeatBooking.countDocuments({
      'orderDetails.source': 'order-creation',
      'orderDetails.type': 'auto-blocked',
      status: 'active'
    });
    
    const autoBlockedExpired = await SeatBooking.countDocuments({
      'orderDetails.source': 'order-creation',
      'orderDetails.type': 'auto-blocked',
      status: 'expired'
    });
    
    // Get seats that will expire soon (within next 10 minutes)
    const expiringSoon = await SeatBooking.countDocuments({
      status: 'active',
      expiresAt: { 
        $gt: new Date(),
        $lte: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }
    });
    
    return {
      total: totalBookings,
      active: activeBookings,
      expired: expiredBookings,
      autoBlocked: {
        active: autoBlockedBookings,
        expired: autoBlockedExpired,
        total: autoBlockedBookings + autoBlockedExpired
      },
      expiringSoon,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting booking stats:', error);
    throw error;
  }
}

// Function to manually expire bookings for testing
async function expireBookingsForOrder(orderId) {
  try {
    const result = await SeatBooking.updateMany(
      { orderId, status: 'active' },
      { $set: { status: 'expired' } }
    );
    console.log(`⏰ Force expired ${result.modifiedCount} bookings for order ${orderId}`);
    return result;
  } catch (error) {
    console.error('❌ Error expiring bookings:', error);
    throw error;
  }
}

// Function to get auto-blocked seats for an order
async function getAutoBlockedSeatsForOrder(orderId) {
  try {
    const bookings = await SeatBooking.find({
      orderId,
      'orderDetails.source': 'order-creation',
      'orderDetails.type': 'auto-blocked'
    }).sort({ seatNumber: 1 });
    
    return bookings.map(booking => ({
      seatNumber: booking.seatNumber,
      status: booking.status,
      expiresAt: booking.expiresAt,
      timeRemaining: Math.max(0, new Date(booking.expiresAt) - new Date()),
      isExpired: new Date() > new Date(booking.expiresAt)
    }));
  } catch (error) {
    console.error('❌ Error getting auto-blocked seats for order:', error);
    throw error;
  }
}

// Function to get all auto-blocked seats
async function getAllAutoBlockedSeats() {
  try {
    const bookings = await SeatBooking.find({
      'orderDetails.source': 'order-creation',
      'orderDetails.type': 'auto-blocked'
    }).sort({ seatNumber: 1 });
    
    return bookings.map(booking => ({
      seatNumber: booking.seatNumber,
      orderId: booking.orderId,
      status: booking.status,
      expiresAt: booking.expiresAt,
      timeRemaining: Math.max(0, new Date(booking.expiresAt) - new Date()),
      isExpired: new Date() > new Date(booking.expiresAt),
      userId: booking.userId,
      userName: booking.userName
    }));
  } catch (error) {
    console.error('❌ Error getting all auto-blocked seats:', error);
    throw error;
  }
}

module.exports = {
  cleanExpiredBookings,
  getBookingStats,
  expireBookingsForOrder,
  getAutoBlockedSeatsForOrder,
  getAllAutoBlockedSeats
};
