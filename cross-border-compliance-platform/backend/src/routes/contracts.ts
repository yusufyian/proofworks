import { Router } from 'express';
import { storage } from '../storage/fileStorage';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const contracts = await storage.findStandardContracts({ status } as any);
    
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = contracts.slice(start, end);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total: contracts.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(contracts.length / Number(limit)),
      },
    });
  } catch (error) {
    throw new AppError('获取合同记录失败', 500);
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const contract = await storage.findStandardContract(req.params.id);
    if (!contract) {
      throw new AppError('合同不存在', 404);
    }
    res.json({ success: true, data: contract });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('获取合同记录失败', 500);
  }
});

export default router;

