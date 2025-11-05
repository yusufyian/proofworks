import { Router } from 'express';
import { traceBatch } from '../controllers/traceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, traceBatch);

export default router;

