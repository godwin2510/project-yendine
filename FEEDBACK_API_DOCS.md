# Feedback API Documentation

This document describes the feedback API endpoints for the Yendine campus food ordering system.

## Base URL
```
http://localhost:5000/api/feedbacks
```

## Endpoints

### 1. Get All Feedback
**GET** `/api/feedbacks`

Retrieves all feedback with pagination and sorting options.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `sort` (optional): Field to sort by (default: 'createdAt')
- `order` (optional): Sort order - 'asc' or 'desc' (default: 'desc')

#### Example Request
```bash
GET /api/feedbacks?page=1&limit=5&sort=createdAt&order=desc
```

#### Response
```json
{
  "feedback": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "feedback": "Great food quality and fast delivery!",
      "userEmail": "user@example.com",
      "userName": "John Doe",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```

### 2. Get Feedback by ID
**GET** `/api/feedbacks/:id`

Retrieves a specific feedback by its ID.

#### Example Request
```bash
GET /api/feedbacks/64f8a1b2c3d4e5f6a7b8c9d0
```

#### Response
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "feedback": "Great food quality and fast delivery!",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 3. Create New Feedback
**POST** `/api/feedbacks`

Creates a new feedback entry.

#### Request Body
```json
{
  "feedback": "Your feedback message here",
  "userEmail": "user@example.com",  // optional
  "userName": "John Doe"           // optional
}
```

#### Example Request
```bash
POST /api/feedbacks
Content-Type: application/json

{
  "feedback": "The food was delicious and the service was excellent!",
  "userEmail": "customer@example.com",
  "userName": "Jane Smith"
}
```

#### Response
```json
{
  "message": "Feedback saved successfully",
  "feedback": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "feedback": "The food was delicious and the service was excellent!",
    "userEmail": "customer@example.com",
    "userName": "Jane Smith",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Delete Feedback
**DELETE** `/api/feedbacks/:id`

Deletes a specific feedback by its ID.

#### Example Request
```bash
DELETE /api/feedbacks/64f8a1b2c3d4e5f6a7b8c9d0
```

#### Response
```json
{
  "message": "Feedback deleted successfully"
}
```

## Frontend Usage

### Using the FeedbackService

The frontend includes a `FeedbackService` class that provides easy-to-use methods for interacting with the feedback API.

```typescript
import { FeedbackService } from '@/services/feedbackService';

// Get all feedback with pagination
const feedbackData = await FeedbackService.getFeedback({
  page: 1,
  limit: 10,
  sort: 'createdAt',
  order: 'desc'
});

// Create new feedback
const newFeedback = await FeedbackService.createFeedback({
  feedback: 'Great service!',
  userEmail: 'user@example.com',
  userName: 'John Doe'
});

// Get recent feedback (last 5)
const recentFeedback = await FeedbackService.getRecentFeedback();

// Get feedback statistics
const stats = await FeedbackService.getFeedbackStats();
```

### Using the FeedbackDisplay Component

The `FeedbackDisplay` component provides a complete UI for displaying and managing feedback.

```tsx
import { FeedbackDisplay } from '@/components/FeedbackDisplay';

// Basic usage
<FeedbackDisplay />

// With all features enabled
<FeedbackDisplay 
  showStats={true}
  showPagination={true}
  limit={10}
  showDelete={true}
  onDelete={(id) => console.log('Deleted feedback:', id)}
/>
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation errors)
- `404`: Not found
- `500`: Internal server error

Error responses include a message field:

```json
{
  "message": "Error description"
}
```

## Database Schema

The feedback is stored in MongoDB with the following schema:

```javascript
{
  feedback: { type: String, required: true },
  userEmail: String,  // optional
  userName: String,   // optional
  createdAt: { type: Date, default: Date.now }
}
```

## Testing

You can test the API endpoints using the provided test script:

```bash
node test-feedback-api.js
```

This script will test all the main endpoints and provide feedback on their functionality.
