import { assignmentService } from './services/assign.js';

async function testCarpooling() {
  try {
    console.log('🚗 Testing improved carpooling system...');

    // Run assignment cycle for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    console.log(`📅 Running assignment cycle for: ${tomorrow.toISOString()}`);

    await assignmentService.runAssignmentCycle(tomorrow);

    console.log('✅ Assignment cycle completed!');
  } catch (error) {
    console.error('❌ Error during assignment cycle:', error);
  }
}


testCarpooling();
