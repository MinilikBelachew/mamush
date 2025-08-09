import { Router } from 'express';
// import { registerPassenger } from '@controllers/passengersControllers.js';
import upload from '../middlewares/upload.js';
import {
  bulkRegisterPassengersFromCSV,
  getAllPassengers,
} from '@controllers/passengersControllers.js';
const router = Router();

// router.post('/register', registerPassenger);
router.post(
  '/upload-csv',
  upload.single('file'),
  bulkRegisterPassengersFromCSV
);
router.get('/all-passengers', getAllPassengers);

export default router;
