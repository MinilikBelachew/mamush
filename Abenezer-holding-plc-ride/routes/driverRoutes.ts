import { Router } from 'express';
import { getDriverById, getDrivers, loginDriver, registerDriver } from '@controllers/driverController.js';

const router = Router();

router.post("/register", registerDriver);
router.post('/login', loginDriver);
router.get("/all-drivers", getDrivers);
router.get("/driver/:id", getDriverById);


export default router;
