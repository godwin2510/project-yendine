const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function testFeedbackAPI() {
  console.log('🧪 Testing Feedback API Endpoints...\n');

  try {
    // Test 1: Create feedback
    console.log('1. Testing POST /api/feedbacks');
    const createResponse = await fetch(`${API_BASE_URL}/feedbacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feedback: 'This is a test feedback from the API test script',
        userEmail: 'test@example.com',
        userName: 'Test User'
      }),
    });

    if (createResponse.ok) {
      const createdFeedback = await createResponse.json();
      console.log('✅ Feedback created successfully:', createdFeedback.message);
      console.log('   Feedback ID:', createdFeedback.feedback._id);
    } else {
      console.log('❌ Failed to create feedback:', createResponse.statusText);
    }

    // Test 2: Get all feedback
    console.log('\n2. Testing GET /api/feedbacks');
    const getResponse = await fetch(`${API_BASE_URL}/feedbacks`);
    
    if (getResponse.ok) {
      const feedbackData = await getResponse.json();
      console.log('✅ Feedback retrieved successfully');
      console.log('   Total feedback:', feedbackData.pagination.totalItems);
      console.log('   Current page:', feedbackData.pagination.currentPage);
      console.log('   Total pages:', feedbackData.pagination.totalPages);
      console.log('   Feedback count:', feedbackData.feedback.length);
    } else {
      console.log('❌ Failed to get feedback:', getResponse.statusText);
    }

    // Test 3: Get feedback with pagination
    console.log('\n3. Testing GET /api/feedbacks with pagination');
    const paginatedResponse = await fetch(`${API_BASE_URL}/feedbacks?page=1&limit=5`);
    
    if (paginatedResponse.ok) {
      const paginatedData = await paginatedResponse.json();
      console.log('✅ Paginated feedback retrieved successfully');
      console.log('   Items per page:', paginatedData.pagination.itemsPerPage);
      console.log('   Feedback count:', paginatedData.feedback.length);
    } else {
      console.log('❌ Failed to get paginated feedback:', paginatedResponse.statusText);
    }

    // Test 4: Get feedback by ID (if we have feedback)
    const getResponse2 = await fetch(`${API_BASE_URL}/feedbacks`);
    if (getResponse2.ok) {
      const feedbackData = await getResponse2.json();
      if (feedbackData.feedback.length > 0) {
        const firstFeedbackId = feedbackData.feedback[0]._id;
        console.log('\n4. Testing GET /api/feedbacks/:id');
        const getByIdResponse = await fetch(`${API_BASE_URL}/feedbacks/${firstFeedbackId}`);
        
        if (getByIdResponse.ok) {
          const singleFeedback = await getByIdResponse.json();
          console.log('✅ Single feedback retrieved successfully');
          console.log('   Feedback content:', singleFeedback.feedback.substring(0, 50) + '...');
        } else {
          console.log('❌ Failed to get feedback by ID:', getByIdResponse.statusText);
        }
      }
    }

    console.log('\n🎉 Feedback API tests completed!');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// Run the test
testFeedbackAPI();
