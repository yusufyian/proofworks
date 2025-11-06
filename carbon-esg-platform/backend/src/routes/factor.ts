import { Router } from 'express';
import { getEmissionFactors, createEmissionFactor } from '../controllers/factorController';

const router = Router();

router.get('/', getEmissionFactors);
router.post('/', createEmissionFactor);

export default router;

