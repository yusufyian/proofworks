import { Router } from 'express';
import { getDataAssets, getDataAsset } from '../controllers/dataAssetController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getDataAssets);
router.get('/:id', authenticate, getDataAsset);

export default router;

