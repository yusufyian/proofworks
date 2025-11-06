import { Router } from 'express';
import {
  getHealthAssessments,
  createHealthAssessment,
} from '../controllers/healthController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getHealthAssessments);
router.post('/', createHealthAssessment);

export default router;