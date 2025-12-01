import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getSpareParts,
  getSparePart,
  createSparePart,
  updateSparePart,
} from '../controllers/sparePartController';

const router = express.Router();

router.use(authenticate);
router.get('/', getSpareParts);
router.get('/:id', getSparePart);
router.post('/', createSparePart);
router.put('/:id', updateSparePart);

export default router;
