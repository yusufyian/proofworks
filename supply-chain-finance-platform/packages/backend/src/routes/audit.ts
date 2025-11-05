import { Router } from 'express';
import { auditController } from '../controllers/auditController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/logs', authorizeRoles('admin'), auditController.getAuditLogs);
router.get('/certificate/:certificateId', auditController.getCertificateAuditTrail);
router.get('/penetration/:certificateId', auditController.getPenetrationTrace);

export default router;

