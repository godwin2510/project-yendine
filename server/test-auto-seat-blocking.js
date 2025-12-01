const AutoSeatBlockingService = require('./services/autoSeatBlocking');
const { getAllAutoBlockedSeats, getBookingStats } = require('./utils/seatCleanup');

// Test the auto seat blocking system
async function testAutoSeatBlocking() {
  try {
    console.log('🧪 Testing Auto Seat Blocking System...\n');
    
    // Test 1: Parse seat numbers from orderNotes
    console.log('📝 Test 1: Parsing seat numbers from orderNotes');
    const testOrderNotes = [
      'Seats booked: 27',
      'Seats booked: 15, 16, 17',
      'Seats booked: 1, 2, 3, 4, 5',
      'No seats mentioned',
      'Seats booked: 99, 100'
    ];
    
    testOrderNotes.forEach(notes => {
      const seats = AutoSeatBlockingService.parseSeatNumbers(notes);
      console.log(`  "${notes}" → [${seats.join(', ')}]`);
    });
    
    console.log('\n📊 Test 2: Getting current booking statistics');
    const stats = await getBookingStats();
    console.log('  Current booking stats:', JSON.stringify(stats, null, 2));
    
    console.log('\n🎯 Test 3: Getting all auto-blocked seats');
    const autoBlockedSeats = await getAllAutoBlockedSeats();
    console.log(`  Found ${autoBlockedSeats.length} auto-blocked seats`);
    
    if (autoBlockedSeats.length > 0) {
      autoBlockedSeats.forEach(seat => {
        const status = seat.isExpired ? '🔴 EXPIRED' : '🟢 ACTIVE';
        const timeLeft = Math.floor(seat.timeRemaining / 60000); // minutes
        console.log(`    Seat ${seat.seatNumber}: ${status} (Order: ${seat.orderId}, Time left: ${timeLeft}m)`);
      });
    }
    
    console.log('\n✅ Auto seat blocking system test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  // Wait for database connection
  setTimeout(() => {
    testAutoSeatBlocking();
  }, 2000);
}

module.exports = { testAutoSeatBlocking };
