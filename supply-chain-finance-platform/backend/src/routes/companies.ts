import { Router } from 'express';
import { getCompanies, getCompanyById } from '../controllers/companyController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getCompanies);
router.get('/:id', getCompanyById);

export default router;

