import { Router } from 'express';
import { getRealTimeData, getDeviceStatus } from '../controllers/monitoringController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/realtime', authenticate, getRealTimeData);
router.get('/devices', authenticate, getDeviceStatus);

export default router;

