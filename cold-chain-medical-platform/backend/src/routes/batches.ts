import { Router } from 'express';
import { getBatches, getBatch } from '../controllers/batchController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getBatches);
router.get('/:id', authenticate, getBatch);

export default router;

