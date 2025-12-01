# Auto Seat Blocking System

## Overview

The Auto Seat Blocking System automatically blocks seats for 30 minutes when food orders are created with seat information. This system ensures that seats are reserved immediately upon order creation, preventing double-bookings and providing a seamless user experience.

## How It Works

### 1. Automatic Seat Detection
When an order is created, the system automatically scans the `orderNotes` field for seat information in the format:
```
"Seats booked: 27"
"Seats booked: 15, 16, 17"
"Seats booked: 1, 2, 3, 4, 5"
```

### 2. Immediate Seat Blocking
- Seats are automatically blocked for **30 minutes** from the moment the order is created
- Each blocked seat gets a unique booking record in the database
- Seats are marked as `auto-blocked` with source `order-creation`

### 3. Automatic Expiration
- The system runs a cleanup job every **5 minutes**
- Expired bookings are automatically marked as `expired`
- Expired seats become available for new bookings

## System Components

### 1. AutoSeatBlockingService (`server/services/autoSeatBlocking.js`)
Core service that handles all seat blocking operations:

- **`parseSeatNumbers(orderNotes)`**: Extracts seat numbers from order notes
- **`blockSeatsForOrder(orderId, userId, userName, orderNotes)`**: Automatically blocks seats for an order
- **`updatePaymentStatus(orderId, paymentDetails)`**: Updates payment verification status
- **`getBlockedSeats(orderId)`**: Retrieves blocked seats for an order
- **`forceExpireSeats(orderId)`**: Manually expires seats (admin function)

### 2. Enhanced Order Routes (`server/routes/orderRoutes.js`)
New endpoints for seat management:

- **`POST /:orderId/block-seats`**: Manually trigger seat blocking for existing orders
- **`GET /:orderId/seats`**: Get seat blocking status for an order
- **`POST /:orderId/expire-seats`**: Force expire seats for an order (admin)

### 3. Enhanced Seat Cleanup (`server/utils/seatCleanup.js`)
Improved cleanup system with detailed logging:

- **`cleanExpiredBookings()`**: Enhanced cleanup with detailed logging
- **`getBookingStats()`**: Comprehensive statistics including auto-blocked seats
- **`getAutoBlockedSeatsForOrder(orderId)`**: Get auto-blocked seats for specific order
- **`getAllAutoBlockedSeats()`**: Get all auto-blocked seats in the system

## Database Schema

### SeatBooking Model Updates
Each auto-blocked seat creates a record with:

```javascript
{
  seatNumber: Number,           // Seat number (1-100)
  orderId: String,              // Associated order ID
  userId: String,               // User who made the order
  userName: String,             // User's display name
  status: 'active',             // Booking status
  expiresAt: Date,              // Expiration time (30 minutes from creation)
  orderDetails: {
    type: 'auto-blocked',       // Type of booking
    source: 'order-creation',   // Source of the booking
    orderNotes: String          // Original order notes
  },
  paymentVerified: false,       // Payment verification status
  paymentStatus: 'pending',     // Payment status
  bookedAt: Date,               // When the seat was blocked
  isTemporary: false            // Not a temporary reservation
}
```

## API Endpoints

### Order Creation (Auto-Seat Blocking)
```
POST /api/orders/create
```
**Request Body:**
```json
{
  "userId": "user@email.com",
  "userName": "John Doe",
  "items": [...],
  "totalAmount": 500,
  "paymentMethod": "razorpay",
  "orderNotes": "Seats booked: 27"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {...},
  "seatBlocking": {
    "success": true,
    "message": "Seats blocked successfully",
    "blockedSeats": [27],
    "orderId": "order_id",
    "expiresAt": "2024-01-01T12:30:00.000Z",
    "bookingsCount": 1
  }
}
```

### Manual Seat Blocking
```
POST /api/orders/:orderId/block-seats
```
Manually trigger seat blocking for existing orders that have seat information.

### Get Seat Status
```
GET /api/orders/:orderId/seats
```
Get the current status of blocked seats for an order.

### Force Expire Seats
```
POST /api/orders/:orderId/expire-seats
```
Admin function to force expire seats for an order.

## Testing the System

### Run the Test Script
```bash
cd server
node test-auto-seat-blocking.js
```

### Test Scenarios
1. **Create an order with seat information** - Seats should be automatically blocked
2. **Check seat availability** - Blocked seats should show as unavailable
3. **Wait for expiration** - Seats should become available after 30 minutes
4. **Manual seat blocking** - Use the API to block seats for existing orders

## Monitoring and Logging

### Console Logs
The system provides detailed logging for all operations:

```
🔄 Auto-blocking seats for order: order_id
📝 Order notes: Seats booked: 27
🎯 Found seats to block: 27
📝 Creating 1 seat bookings with 30-minute expiry
✅ Successfully blocked 1 seats for order order_id
⏰ Seats will expire at: 2024-01-01T12:30:00.000Z
```

### Cleanup Logs
Every 5 minutes, the cleanup job logs:

```
🔄 Found 2 expired bookings to clean up
⏰ Expiring seat 27 from order order_id (order-creation/auto-blocked)
⏰ Expiring seat 15 from order order_id2 (order-creation/auto-blocked)
✅ Cleaned 2 expired bookings at 2024-01-01T12:30:00.000Z
```

## Configuration

### Cleanup Schedule
- **Frequency**: Every 5 minutes
- **Timeout**: 30 minutes for seat reservations
- **Location**: `server/index.js` (lines 45-55)

### Seat Range
- **Total Seats**: 100 (1-100)
- **Validation**: Seats must be between 1 and 100

## Error Handling

### Common Scenarios
1. **Seats Already Blocked**: Returns error with list of unavailable seats
2. **Invalid Seat Numbers**: Filters out invalid seat numbers
3. **Database Errors**: Logs errors but doesn't fail order creation
4. **Payment Verification**: Seats remain blocked until payment is verified

### Fallback Behavior
- If seat blocking fails, the order is still created
- Users can manually trigger seat blocking later
- System continues to function even with seat blocking issues

## Benefits

1. **Immediate Seat Reservation**: Seats are blocked instantly upon order creation
2. **Prevents Double-Booking**: No race conditions between order creation and seat booking
3. **Automatic Cleanup**: No manual intervention required for expired bookings
4. **Detailed Logging**: Full audit trail of all seat operations
5. **Admin Control**: Manual override capabilities for administrators
6. **Payment Integration**: Seamless integration with payment verification

## Future Enhancements

1. **Dynamic Timeout**: Configurable expiration times based on order type
2. **Priority Seating**: VIP or premium seat handling
3. **Bulk Operations**: Handle multiple orders simultaneously
4. **Real-time Updates**: WebSocket integration for live seat status
5. **Analytics Dashboard**: Detailed reporting on seat utilization

## Troubleshooting

### Common Issues
1. **Seats not being blocked**: Check orderNotes format and database connection
2. **Cleanup not running**: Verify the scheduled job in server/index.js
3. **Payment verification issues**: Check payment service integration
4. **Database errors**: Verify MongoDB connection and schema

### Debug Commands
```bash
# Check current seat status
curl http://localhost:5000/api/seats/status

# Get order details
curl http://localhost:5000/api/orders/:orderId

# Check seat blocking for an order
curl http://localhost:5000/api/orders/:orderId/seats

# Run test script
node test-auto-seat-blocking.js
```

## Support

For issues or questions about the Auto Seat Blocking System:
1. Check the console logs for detailed error messages
2. Verify the database connection and schema
3. Test with the provided test script
4. Review the API endpoints and request/response formats
