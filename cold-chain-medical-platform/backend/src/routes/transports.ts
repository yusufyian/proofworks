import { Router } from 'express';
import { getTransports, getTransport } from '../controllers/transportController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getTransports);
router.get('/:id', authenticate, getTransport);

export default router;

