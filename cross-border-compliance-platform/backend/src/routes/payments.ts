import { Router } from 'express';
import { storage } from '../storage/fileStorage';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const payments = await storage.findCrossBorderPayments({ status } as any);
    
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = payments.slice(start, end);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total: payments.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(payments.length / Number(limit)),
      },
    });
  } catch (error) {
    throw new AppError('获取支付记录失败', 500);
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const payment = await storage.findCrossBorderPayment(req.params.id);
    if (!payment) {
      throw new AppError('支付记录不存在', 404);
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('获取支付记录失败', 500);
  }
});

export default router;

