import { Router } from 'express';
import { 
  getComputingTasks, 
  createComputingTask, 
  updateTaskStatus 
} from '../controllers/computingTaskController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getComputingTasks);
router.post('/', authenticate, createComputingTask);
router.patch('/:id/status', authenticate, updateTaskStatus);

export default router;

