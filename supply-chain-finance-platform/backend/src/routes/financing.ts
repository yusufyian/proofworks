import { Router } from 'express';
import {
  createFinancing,
  getFinancings,
  getFinancingById,
  approveFinancing,
  rejectFinancing,
  disburseFinancing
} from '../controllers/financingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createFinancing);
router.get('/', getFinancings);
router.get('/:id', getFinancingById);
router.post('/:id/approve', approveFinancing);
router.post('/:id/reject', rejectFinancing);
router.post('/:id/disburse', disburseFinancing);

export default router;

