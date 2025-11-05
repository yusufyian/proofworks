import { Router } from 'express';
import { riskController } from '../controllers/riskController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/assess', riskController.assessRisk);
router.get('/score/:certificateId', riskController.getRiskScore);
router.post('/check-duplicate-financing', riskController.checkDuplicateFinancing);
router.post('/check-circular-pledge', riskController.checkCircularPledge);

export default router;

