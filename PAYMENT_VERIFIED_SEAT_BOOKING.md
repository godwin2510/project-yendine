# Payment-Verified Seat Booking System

## Overview

The seat booking system has been updated to **only book seats after successful Razorpay payment completion**. This ensures that seats are reserved only for customers who have completed their payment, preventing no-shows and improving revenue management.

## Key Changes

### 1. Payment Verification Required
- **Before**: Seats could be booked immediately without payment
- **After**: Seats are only booked after successful Razorpay payment verification
- **Security**: Double verification using both signature validation and Razorpay API calls

### 2. New API Endpoints

#### Primary Booking Endpoint
```
POST /api/seats/book-after-payment
```
**Required Fields:**
- `seats`: Array of seat numbers
- `orderId`: Unique order identifier
- `userId`: User email/ID (optional)
- `userName`: User's display name
- `orderDetails`: Additional order information (optional)
- `razorpayOrderId`: Razorpay order ID
- `razorpayPaymentId`: Razorpay payment ID
- `razorpaySignature`: Payment signature for verification

#### Payment Status Check
```
GET /api/seats/payment-status/:orderId
```
Returns payment verification status and booking details.

#### Temporary Reservation (Optional)
```
POST /api/seats/reserve-temp
```
Creates temporary 5-minute reservations during payment processing.

#### Confirm Reservations
```
POST /api/seats/confirm-reservations
```
Converts temporary reservations to confirmed bookings after payment.

### 3. Updated Database Schema

The `SeatBooking` model now includes:

```javascript
{
  // ... existing fields ...
  paymentVerified: Boolean,        // Default: false
  razorpayOrderId: String,         // Razorpay order ID
  razorpayPaymentId: String,       // Razorpay payment ID
  paymentStatus: String,           // 'pending' | 'completed' | 'failed' | 'refunded'
  paymentAmount: Number,           // Payment amount
  paymentCurrency: String,         // Default: 'INR'
  isTemporary: Boolean            // Default: false
}
```

## Workflow

### Option 1: Direct Payment + Booking
1. **Customer selects seats** and initiates payment
2. **Payment processed** through Razorpay
3. **Payment verification** on server
4. **Seats booked immediately** if payment successful
5. **30-minute booking duration** starts

### Option 2: Temporary Reservation + Confirmation
1. **Customer selects seats** and creates temporary reservation (5 minutes)
2. **Payment processed** through Razorpay
3. **Payment verification** on server
4. **Temporary reservation confirmed** and extended to 30 minutes
5. **Seats officially booked**

## Security Features

### 1. Signature Verification
```javascript
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const text = orderId + '|' + paymentId;
  const generatedSignature = crypto
    .createHmac('sha256', razorpay.key_secret)
    .update(text)
    .digest('hex');
  
  return generatedSignature === signature;
};
```

### 2. Razorpay API Verification
- Fetches payment details from Razorpay
- Verifies payment status is 'captured'
- Ensures order ID matches
- Prevents replay attacks

### 3. Database Constraints
- Only `paymentVerified: true` bookings count as active
- Temporary reservations have separate cleanup
- Payment status tracking for audit trails

## Client-Side Integration

### Updated SeatService Methods

```typescript
// New primary method
static async bookSeatsAfterPayment(bookingData: PaymentVerifiedBookingRequest)

// Payment verification helper
static async verifyPaymentAndBookSeats(...)

// Payment status check
static async getPaymentStatus(orderId: string)
```

### Example Usage

```typescript
import { SeatService } from './services/seatService';

// Book seats after payment
const bookingResult = await SeatService.bookSeatsAfterPayment({
  seats: [1, 2, 3],
  orderId: 'order_123',
  userId: 'user@example.com',
  userName: 'John Doe',
  razorpayOrderId: 'razorpay_order_456',
  razorpayPaymentId: 'razorpay_payment_789',
  razorpaySignature: 'verified_signature_here'
});

// Check payment status
const paymentStatus = await SeatService.getPaymentStatus('order_123');
```

## Error Handling

### Common Error Scenarios

1. **Payment Verification Failed**
   - Invalid signature
   - Payment not completed
   - Order ID mismatch

2. **Seat Availability**
   - Seats no longer available
   - Conflict with other bookings

3. **Temporary Reservation Expired**
   - 5-minute window expired
   - Payment not completed in time

### Error Response Format

```json
{
  "success": false,
  "message": "Detailed error message",
  "error": "Technical error details",
  "redirectTo": "/book-after-payment",
  "requiredFields": ["field1", "field2"]
}
```

## Migration Notes

### For Existing Applications

1. **Update API calls** to use `/book-after-payment` endpoint
2. **Include payment verification** data in booking requests
3. **Handle payment-first workflow** in UI
4. **Update error handling** for payment verification failures

### Backward Compatibility

- Old `/book` endpoint returns error with redirect information
- Existing bookings remain valid
- New fields are optional for existing data

## Monitoring and Maintenance

### Automatic Cleanup

- **Expired bookings**: Every 5 minutes
- **Temporary reservations**: Every 5 minutes
- **Payment verification logs**: Detailed logging for debugging

### Admin Functions

- View all bookings with payment status
- Force expire bookings if needed
- Payment verification audit trails
- Temporary reservation management

## Testing

### Test Scenarios

1. **Successful Payment + Booking**
2. **Failed Payment + No Booking**
3. **Temporary Reservation Expiry**
4. **Payment Verification Failure**
5. **Seat Conflict Resolution**

### Test Data

Use Razorpay test keys for development:
- Key ID: `rzp_test_R9Gsfwn9dWKpPN`
- Key Secret: `jEQ0qUumMXfWmdfzkCvpGA0T`

## Benefits

1. **Revenue Protection**: No unpaid seat reservations
2. **Better Resource Management**: Accurate occupancy tracking
3. **Customer Commitment**: Confirmed bookings only
4. **Audit Trail**: Complete payment verification history
5. **Flexibility**: Optional temporary reservation system

## Future Enhancements

1. **Multiple Payment Gateway Support**
2. **Partial Payment Handling**
3. **Refund Processing**
4. **Advanced Booking Rules**
5. **Real-time Payment Webhooks**
