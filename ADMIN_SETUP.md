# Admin Access Setup

This document explains how to set up admin access for the Yendine application.

## Overview

The admin page is now protected and can only be accessed by users with admin privileges. Regular users will be redirected to the home page if they try to access `/admin`.

## Setup Instructions

### 1. Database Schema Update

The user model has been updated to include an `isAdmin` field. New users will have `isAdmin: false` by default.

### 2. Grant Admin Access to a User

To make an existing user an admin, use the provided script:

```bash
cd server
node scripts/setupAdmin.js <user-email>
```

**Example:**
```bash
node scripts/setupAdmin.js admin@example.com
```

### 3. Verify Admin Access

After running the script, the user should be able to:
- Access the `/admin` route
- See the admin dashboard
- Manage food items, orders, and other admin functions

## Security Features

### Frontend Protection
- `AdminRoute` component checks admin status before rendering
- Non-admin users are redirected to `/home`
- Loading states prevent unauthorized access

### Backend Protection
- `adminAuth` middleware verifies admin privileges
- JWT token validation
- Database-level admin status checking

### API Endpoints
- `/api/auth/check-admin` - Verifies if current user is admin
- All admin routes are protected by middleware

## File Structure

```
server/
├── middleware/
│   ├── auth.js          # General authentication
│   └── adminAuth.js     # Admin-specific authentication
├── models/
│   └── userModel.js     # Updated with isAdmin field
├── routes/
│   └── authRoutes.js    # Admin status checking endpoint
└── scripts/
    └── setupAdmin.js    # Script to grant admin access

client/
├── components/
│   └── AdminRoute.tsx   # Protected route component
├── services/
│   └── api.ts          # Admin status checking function
└── pages/
    └── Admin.tsx       # Updated with admin verification
```

## Troubleshooting

### User Still Can't Access Admin Page
1. Verify the user exists in the database
2. Check if `isAdmin` field is set to `true`
3. Ensure the user is logged in with a valid token
4. Check browser console for any errors

### Script Errors
1. Ensure MongoDB connection string is correct
2. Verify the user email exists in the database
3. Check if all required environment variables are set

### Frontend Issues
1. Clear browser localStorage and re-login
2. Check if the auth token is valid
3. Verify the API endpoint is accessible

## Security Notes

- Admin status is checked on every admin page load
- JWT tokens are validated on the server side
- Non-admin users cannot access admin API endpoints
- Admin privileges are stored securely in the database

## Future Enhancements

- Role-based access control (RBAC) system
- Admin activity logging
- Two-factor authentication for admin accounts
- Admin user management interface
