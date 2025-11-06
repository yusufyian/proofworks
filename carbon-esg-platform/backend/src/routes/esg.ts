import { Router } from 'express';
import {
  getESGReports,
  getESGReport,
  createESGReport,
  updateESGReport,
} from '../controllers/esgController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getESGReports);
router.get('/:id', getESGReport);
router.post('/', createESGReport);
router.put('/:id', updateESGReport);

export default router;

