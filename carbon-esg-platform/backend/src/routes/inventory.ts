import { Router } from 'express';
import {
  getInventories,
  getInventory,
  createInventory,
  updateInventory,
  getActivityData,
  createActivityData,
} from '../controllers/inventoryController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getInventories);
router.get('/activity', getActivityData);
router.get('/:id', getInventory);
router.post('/', createInventory);
router.post('/activity', createActivityData);
router.put('/:id', updateInventory);

export default router;

