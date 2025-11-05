import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { performThreeWayMatch, getMatches } from '../controllers/matchController';

const router = express.Router();

router.use(authenticateToken);
router.post('/three-way', performThreeWayMatch);
router.get('/', getMatches);

export default router;

