import { Router } from 'express';
import {
  getProductFootprints,
  getProductFootprint,
  createProductFootprint,
  updateProductFootprint,
} from '../controllers/productController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getProductFootprints);
router.get('/:id', getProductFootprint);
router.post('/', createProductFootprint);
router.put('/:id', updateProductFootprint);

export default router;

