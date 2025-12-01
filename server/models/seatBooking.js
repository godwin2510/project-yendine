const mongoose = require('mongoose');

const seatBookingSchema = new mongoose.Schema({
  seatNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  orderId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: false // Optional for guest users
  },
  userName: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'completed'],
    default: 'active'
  },
  bookedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  orderDetails: {
    type: Object,
    required: false
  },
  // New payment verification fields
  paymentVerified: {
    type: Boolean,
    default: false,
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: false
  },
  razorpayPaymentId: {
    type: String,
    required: false
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    required: false
  },
  paymentCurrency: {
    type: String,
    default: 'INR'
  },
  // Temporary reservation field
  isTemporary: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
seatBookingSchema.index({ seatNumber: 1, status: 1 });
seatBookingSchema.index({ expiresAt: 1 });
seatBookingSchema.index({ paymentVerified: 1 });
seatBookingSchema.index({ razorpayOrderId: 1 });
seatBookingSchema.index({ razorpayPaymentId: 1 });
seatBookingSchema.index({ isTemporary: 1 });

// Method to check if booking is expired
seatBookingSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to check if payment is verified
seatBookingSchema.methods.isPaymentVerified = function() {
  return this.paymentVerified && this.paymentStatus === 'completed';
};

// Method to check if booking is temporary
seatBookingSchema.methods.isTemporaryReservation = function() {
  return this.isTemporary && !this.paymentVerified;
};

// Static method to get all active bookings (only payment verified ones)
seatBookingSchema.statics.getActiveBookings = function() {
  return this.find({
    status: 'active',
    expiresAt: { $gt: new Date() },
    paymentVerified: true,
    paymentStatus: 'completed'
  });
};

// Static method to get available seats (only considering payment verified bookings)
seatBookingSchema.statics.getAvailableSeats = async function() {
  const activeBookings = await this.getActiveBookings();
  const bookedSeats = activeBookings.map(booking => booking.seatNumber);
  
  const allSeats = Array.from({ length: 100 }, (_, i) => i + 1);
  return allSeats.filter(seat => !bookedSeats.includes(seat));
};

// Static method to clean expired bookings
seatBookingSchema.statics.cleanExpiredBookings = async function() {
  return this.updateMany(
    {
      status: 'active',
      expiresAt: { $lte: new Date() }
    },
    {
      $set: { status: 'expired' }
    }
  );
};

// Static method to clean expired temporary reservations
seatBookingSchema.statics.cleanExpiredTempReservations = async function() {
  return this.updateMany(
    {
      isTemporary: true,
      status: 'active',
      expiresAt: { $lte: new Date() }
    },
    {
      $set: { status: 'expired' }
    }
  );
};

// Static method to get bookings by payment ID
seatBookingSchema.statics.getBookingsByPaymentId = function(paymentId) {
  return this.find({ razorpayPaymentId: paymentId });
};

// Static method to get bookings by Razorpay order ID
seatBookingSchema.statics.getBookingsByRazorpayOrderId = function(orderId) {
  return this.find({ razorpayOrderId: orderId });
};

// Static method to get pending payment bookings
seatBookingSchema.statics.getPendingPaymentBookings = function() {
  return this.find({
    paymentVerified: false,
    status: 'active'
  });
};

// Static method to get temporary reservations
seatBookingSchema.statics.getTemporaryReservations = function() {
  return this.find({
    isTemporary: true,
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
};

module.exports = mongoose.model('SeatBooking', seatBookingSchema);
