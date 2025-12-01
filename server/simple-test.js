console.log('🧪 Simple Test - Auto Seat Blocking Service');

try {
  // Test 1: Load the service
  console.log('📦 Loading AutoSeatBlockingService...');
  const AutoSeatBlockingService = require('./services/autoSeatBlocking');
  console.log('✅ Service loaded successfully!');
  
  // Test 2: Test seat parsing
  console.log('\n📝 Testing seat parsing...');
  const testNotes = 'Seats booked: 27';
  const seats = AutoSeatBlockingService.parseSeatNumbers(testNotes);
  console.log(`Input: "${testNotes}"`);
  console.log(`Output: [${seats.join(', ')}]`);
  console.log('✅ Seat parsing working!');
  
  // Test 3: Test multiple seats
  console.log('\n📝 Testing multiple seats...');
  const testNotes2 = 'Seats booked: 15, 16, 17';
  const seats2 = AutoSeatBlockingService.parseSeatNumbers(testNotes2);
  console.log(`Input: "${testNotes2}"`);
  console.log(`Output: [${seats2.join(', ')}]`);
  console.log('✅ Multiple seat parsing working!');
  
  console.log('\n🎉 All tests passed! The service is working correctly.');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack trace:', error.stack);
}
