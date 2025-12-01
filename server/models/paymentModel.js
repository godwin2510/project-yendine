const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: String, // Email from Gmail
    required: true
  },
  userName: {
    type: String, // Name from Gmail
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  orderDetails: {
    items: [{
      name: String,
      quantity: Number,
      price: Number
    }],
    totalAmount: Number
  },
  paymentMethod: {
    type: String,
    default: 'razorpay'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
