# Table Management System

This document describes the table management system implemented for the Yendine campus food ordering platform.

## Overview

The table management system allows users to book seats (tables) when ordering food, with automatic expiration after 30 minutes. The system includes:

- **100 seats** available for booking
- **30-minute timeout** for seat reservations
- **Real-time status updates** with auto-refresh
- **Visual seat grid** showing availability
- **Admin dashboard** for managing bookings
- **Automatic cleanup** of expired bookings

## Features

### 1. Seat Booking
- Users can select multiple seats when placing food orders
- Seats are reserved for 30 minutes from booking time
- Automatic expiration and cleanup
- Real-time availability checking

### 2. Visual Interface
- 10x10 grid layout showing all 100 seats
- Color-coded status:
  - 🟢 Green: Available
  - 🔴 Red: Occupied
  - 🔵 Blue: Selected by current user
- Hover tooltips showing booking details
- Time remaining display for occupied seats

### 3. Admin Dashboard
- Real-time statistics and metrics
- View all bookings with pagination
- Force expire bookings manually
- 24-hour activity tracking

### 4. Automatic Cleanup
- Background job runs every 5 minutes
- Automatically marks expired bookings
- Maintains system performance

## API Endpoints

### Seat Management
- `GET /api/seats/status` - Get all seat status
- `GET /api/seats/available` - Get available seats only
- `POST /api/seats/book` - Book seats
- `DELETE /api/seats/cancel/:orderId` - Cancel booking
- `PATCH /api/seats/extend/:orderId` - Extend booking time

### Admin Endpoints
- `GET /api/seats/admin/all` - Get all bookings (paginated)
- `GET /api/seats/admin/stats` - Get booking statistics
- `POST /api/seats/admin/expire/:orderId` - Force expire bookings

## Database Schema

### SeatBooking Model
```javascript
{
  seatNumber: Number,      // 1-100
  orderId: String,         // Unique order identifier
  userId: String,          // Optional user ID
  userName: String,        // Optional user name
  status: String,          // 'active', 'expired', 'completed'
  bookedAt: Date,          // Booking timestamp
  expiresAt: Date,         // Expiration timestamp
  orderDetails: Object     // Order information
}
```

## Usage Flow

### For Users
1. Add food items to cart
2. Proceed to checkout
3. Select payment method
4. Choose seats from the simple seat selection interface
5. Complete payment
6. Seats are automatically booked for 30 minutes

### For Admins
1. Access the Admin Panel (Admin.tsx)
2. Navigate to the "Seat Management" tab
3. View real-time statistics and booking overview
4. Monitor active bookings with detailed information
5. Manage expired bookings manually
6. Force expire bookings if needed
7. Use the visual seat grid for direct management

## Technical Implementation

### Frontend Components
- `SeatManagement.tsx` - Visual seat grid component (used in Admin panel)
- `SeatAdminDashboard.tsx` - Admin management interface (used in Admin panel)
- `seatService.ts` - API service for seat operations
- Simple seat selection interface in Food.tsx for user booking

### Backend Services
- `seatBooking.js` - MongoDB model with methods
- `seatRoutes.js` - Express routes for seat operations
- `seatCleanup.js` - Utility for cleaning expired bookings

### Real-time Updates
- Auto-refresh every 30 seconds
- WebSocket support (can be added for real-time updates)
- Background cleanup job every 5 minutes

## Configuration

### Timeout Settings
- **Booking Duration**: 30 minutes (configurable)
- **Cleanup Interval**: 5 minutes (configurable)
- **Refresh Interval**: 30 seconds (configurable)

### Seat Layout
- **Total Seats**: 100
- **Grid Layout**: 10x10
- **Seat Numbers**: 1-100

## Security Considerations

- Input validation for seat numbers
- Rate limiting for booking requests
- User authentication (can be added)
- Admin authorization (can be added)

## Future Enhancements

1. **Real-time WebSocket updates** for instant status changes
2. **User authentication** and booking history
3. **Seat preferences** and favorites
4. **Group booking** functionality
5. **Seat categories** (window, corner, etc.)
6. **Booking notifications** via email/SMS
7. **Analytics dashboard** with usage patterns

## Troubleshooting

### Common Issues
1. **Seats not updating**: Check if cleanup job is running
2. **Booking conflicts**: Verify seat availability before booking
3. **Performance issues**: Monitor database indexes

### Debug Commands
```bash
# Check booking statistics
curl http://localhost:5000/api/seats/admin/stats

# Get all seat status
curl http://localhost:5000/api/seats/status

# Force expire bookings for an order
curl -X POST http://localhost:5000/api/seats/admin/expire/ORDER_ID
```

## Monitoring

The system includes built-in monitoring:
- Booking statistics
- Active vs expired bookings
- 24-hour activity tracking
- Error logging and alerts

For production deployment, consider adding:
- Application performance monitoring (APM)
- Database query optimization
- Load balancing for high traffic
- Backup and recovery procedures
