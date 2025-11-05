import { Router } from 'express';
import { financingController } from '../controllers/financingController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/apply', financingController.applyForFinancing);
router.get('/applications', financingController.getApplications);
router.get('/applications/:id', financingController.getApplicationById);
router.post(
  '/applications/:id/approve',
  authorizeRoles('bank', 'admin'),
  financingController.approveApplication
);
router.post(
  '/applications/:id/reject',
  authorizeRoles('bank', 'admin'),
  financingController.rejectApplication
);
router.post(
  '/applications/:id/disburse',
  authorizeRoles('bank', 'admin'),
  financingController.disburseFunds
);

export default router;

