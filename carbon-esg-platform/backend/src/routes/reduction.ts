import { Router } from 'express';
import {
  getReductionProjects,
  getReductionProject,
  createReductionProject,
  updateReductionProject,
} from '../controllers/reductionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getReductionProjects);
router.get('/:id', getReductionProject);
router.post('/', createReductionProject);
router.put('/:id', updateReductionProject);

export default router;

