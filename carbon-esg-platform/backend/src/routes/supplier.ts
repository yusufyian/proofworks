import { Router } from 'express';
import {
  getSupplierCarbonData,
  createSupplierCarbonData,
} from '../controllers/supplierController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getSupplierCarbonData);
router.post('/', createSupplierCarbonData);

export default router;

