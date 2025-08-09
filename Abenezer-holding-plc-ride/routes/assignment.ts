import { Router } from 'express';
import {
  assignSelectedDriver,
  getAllUnAssigned,
  getAlongTripAssignments,
  getAssignedAssignments,
  getAssignmentHistoryByDate,
  getAvailableDrivers,
  getDriversAssignment,
  triggerAssignmentCycle,
  updateDriverStatusManually,
} from '@controllers/assingment.js';

const router = Router();

router.post('/trigger-assignment', triggerAssignmentCycle);
router.put('/drivers/:driverId/status', updateDriverStatusManually);
router.get('/all-assignments', getAssignedAssignments);
router.get('/along-trip', getAlongTripAssignments);
router.get('/history', getAssignmentHistoryByDate);
router.get('/unassigned',getAllUnAssigned)
router.post("/available-drivers",getAvailableDrivers )
router.post("/assignSelectedDriver", assignSelectedDriver)
router.get("/driversAssignment/:id", getDriversAssignment);


export default router;
