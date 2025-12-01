const Order = require('../models/orderModel');
const SeatBooking = require('../models/seatBooking');

class AutoSeatBlockingService {
  /**
   * Parse seat numbers from orderNotes
   * @param {string} orderNotes - The order notes containing seat information
   * @returns {number[]} Array of seat numbers
   */
  static parseSeatNumbers(orderNotes) {
    if (!orderNotes) return [];
    
    const seatMatch = orderNotes.match(/Seats booked:\s*([\d,\s]+)/i);
    if (!seatMatch) return [];
    
    const seatString = seatMatch[1];
    return seatString
      .split(',')
      .map(seat => parseInt(seat.trim()))
      .filter(seat => !isNaN(seat) && seat >= 1 && seat <= 100);
  }

  /**
   * Automatically block seats for an order
   * @param {string} orderId - The order ID
   * @param {string} userId - The user ID
   * @param {string} userName - The user name
   * @param {string} orderNotes - The order notes containing seat information
   * @returns {Object} Result of the blocking operation
   */
  static async blockSeatsForOrder(orderId, userId, userName, orderNotes) {
    try {
      console.log(`🔄 Auto-blocking seats for order ${orderId}`);
      console.log(`📝 Order notes: ${orderNotes}`);
      
      // Parse seat numbers from orderNotes
      const seatNumbers = this.parseSeatNumbers(orderNotes);
      
      if (seatNumbers.length === 0) {
        console.log(`ℹ️ No seats found in order notes for order ${orderId}`);
        return {
          success: true,
          message: 'No seats to block',
          blockedSeats: [],
          orderId
        };
      }
      
      console.log(`🎯 Found seats to block: ${seatNumbers.join(', ')}`);
      
      // Check if seats are already blocked
      const unavailableSeats = [];
      for (const seatNumber of seatNumbers) {
        const existingBooking = await SeatBooking.findOne({
          seatNumber,
          status: 'active',
          expiresAt: { $gt: new Date() }
        });
        
        if (existingBooking) {
          console.log(`⚠️ Seat ${seatNumber} is already blocked by order ${existingBooking.orderId}`);
          unavailableSeats.push(seatNumber);
        }
      }
      
      if (unavailableSeats.length > 0) {
        console.log(`❌ Some seats are already blocked: ${unavailableSeats.join(', ')}`);
        return {
          success: false,
          message: 'Some seats are already blocked',
          unavailableSeats,
          orderId
        };
      }
      
      // Calculate expiration time (30 minutes from now)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      
      // Create seat bookings for all seats
      const bookings = seatNumbers.map(seatNumber => ({
        seatNumber,
        orderId,
        userId: userId || null,
        userName: userName || 'Guest User',
        status: 'active',
        expiresAt,
        orderDetails: {
          type: 'auto-blocked',
          source: 'order-creation',
          orderNotes: orderNotes
        },
        paymentVerified: false, // Will be updated when payment is completed
        paymentStatus: 'pending',
        bookedAt: new Date(),
        isTemporary: false
      }));
      
      console.log(`📝 Creating ${bookings.length} seat bookings with 30-minute expiry`);
      
      // Insert all bookings
      const createdBookings = await SeatBooking.insertMany(bookings);
      
      console.log(`✅ Successfully blocked ${createdBookings.length} seats for order ${orderId}`);
      console.log(`⏰ Seats will expire at: ${expiresAt.toISOString()}`);
      
      return {
        success: true,
        message: 'Seats blocked successfully',
        blockedSeats: seatNumbers,
        orderId,
        expiresAt,
        bookingsCount: createdBookings.length
      };
      
    } catch (error) {
      console.error(`❌ Error blocking seats for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Update seat booking payment status when payment is completed
   * @param {string} orderId - The order ID
   * @param {Object} paymentDetails - Payment verification details
   * @returns {Object} Result of the update operation
   */
  static async updatePaymentStatus(orderId, paymentDetails) {
    try {
      console.log(`💰 Updating payment status for order ${orderId}`);
      
      const updateResult = await SeatBooking.updateMany(
        { orderId },
        {
          $set: {
            paymentVerified: true,
            paymentStatus: 'completed',
            razorpayOrderId: paymentDetails.razorpayOrderId,
            razorpayPaymentId: paymentDetails.razorpayPaymentId,
            paymentAmount: paymentDetails.amount,
            paymentCurrency: paymentDetails.currency || 'INR'
          }
        }
      );
      
      console.log(`✅ Updated payment status for ${updateResult.modifiedCount} seat bookings`);
      
      return {
        success: true,
        message: 'Payment status updated successfully',
        modifiedCount: updateResult.modifiedCount,
        orderId
      };
      
    } catch (error) {
      console.error(`❌ Error updating payment status for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Get blocked seats for an order
   * @param {string} orderId - The order ID
   * @returns {Object} Blocked seats information
   */
  static async getBlockedSeats(orderId) {
    try {
      const bookings = await SeatBooking.find({ orderId }).sort({ seatNumber: 1 });
      
      if (bookings.length === 0) {
        return {
          success: false,
          message: 'No blocked seats found for this order',
          orderId
        };
      }
      
      const blockedSeats = bookings.map(booking => ({
        seatNumber: booking.seatNumber,
        status: booking.status,
        expiresAt: booking.expiresAt,
        paymentVerified: booking.paymentVerified,
        paymentStatus: booking.paymentStatus,
        timeRemaining: Math.max(0, new Date(booking.expiresAt) - new Date())
      }));
      
      return {
        success: true,
        message: 'Blocked seats retrieved successfully',
        orderId,
        blockedSeats,
        totalSeats: blockedSeats.length
      };
      
    } catch (error) {
      console.error(`❌ Error getting blocked seats for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Force expire seats for an order (admin function)
   * @param {string} orderId - The order ID
   * @returns {Object} Result of the expiration operation
   */
  static async forceExpireSeats(orderId) {
    try {
      console.log(`⏰ Force expiring seats for order ${orderId}`);
      
      const updateResult = await SeatBooking.updateMany(
        { orderId, status: 'active' },
        { $set: { status: 'expired' } }
      );
      
      console.log(`✅ Force expired ${updateResult.modifiedCount} seats for order ${orderId}`);
      
      return {
        success: true,
        message: 'Seats force expired successfully',
        modifiedCount: updateResult.modifiedCount,
        orderId
      };
      
    } catch (error) {
      console.error(`❌ Error force expiring seats for order ${orderId}:`, error);
      throw error;
    }
  }
}

module.exports = AutoSeatBlockingService;
