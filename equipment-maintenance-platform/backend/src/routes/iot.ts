import express from 'express';
import { authenticate } from '../middleware/auth';
import { getIoTData, createIoTData } from '../controllers/iotController';

const router = express.Router();

router.use(authenticate);
router.get('/', getIoTData);
router.post('/', createIoTData);

export default router;

