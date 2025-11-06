import { Router } from 'express';
import {
  getMaintenancePlans,
  createMaintenancePlan,
  updateMaintenancePlan,
} from '../controllers/maintenanceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getMaintenancePlans);
router.post('/', createMaintenancePlan);
router.put('/:id', updateMaintenancePlan);

export default router;