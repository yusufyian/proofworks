import { Router } from 'express';
import {
  getAlerts,
  getAlert,
  acknowledgeAlert,
  resolveAlert,
} from '../controllers/alertController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAlerts);
router.get('/:id', authenticate, getAlert);
router.post('/:id/acknowledge', authenticate, acknowledgeAlert);
router.post('/:id/resolve', authenticate, resolveAlert);

export default router;

