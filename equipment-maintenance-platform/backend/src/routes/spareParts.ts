import { Router } from 'express';
import {
  getSpareParts,
  createSparePart,
  updateSparePart,
} from '../controllers/sparePartController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getSpareParts);
router.post('/', createSparePart);
router.put('/:id', updateSparePart);

export default router;
