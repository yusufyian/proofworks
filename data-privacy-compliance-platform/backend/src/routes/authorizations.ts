import { Router } from 'express';
import { 
  getAuthorizations, 
  createAuthorization, 
  updateAuthorizationStatus 
} from '../controllers/authorizationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAuthorizations);
router.post('/', authenticate, createAuthorization);
router.patch('/:id/status', authenticate, updateAuthorizationStatus);

export default router;

