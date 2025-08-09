import cron from 'node-cron';
// import { assignmentService } from '../services/assign.js';
import { runAssignmentCycle } from 'services/ass';
import { prisma } from '@utils/prisma';

const CRON_SCHEDULE = process.env.ASSIGNMENT_CRON_SCHEDULE || '*/1 * * * *';

export function startAssignmentJob() {
  console.log(`Starting assignment job with schedule: ${CRON_SCHEDULE}`);

  cron.schedule(CRON_SCHEDULE, async () => {
    console.log(`[${new Date().toISOString()}] Running assignment cycle...`);
    try {
      await runAssignmentCycle();
    } catch (error) {
      console.error(`Error in assignment cycle:`, error);
    }
  });

  console.log('Assignment cron job started.');
}

async function shutdown() {
  console.log('Shutting down assignment scheduler...');
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
