import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAllWorkOrders,
  getWorkOrder,
  createWorkOrder,
  updateWorkOrder,
} from '../controllers/workOrderController';

const router = express.Router();

router.use(authenticate);
router.get('/', getAllWorkOrders);
router.get('/:id', getWorkOrder);
router.post('/', createWorkOrder);
router.put('/:id', updateWorkOrder);

export default router;
