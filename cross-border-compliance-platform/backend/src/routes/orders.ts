import { Router } from 'express';
import { storage } from '../storage/fileStorage';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const orders = await storage.findSupplyChainOrders({ status } as any);
    
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = orders.slice(start, end);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total: orders.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(orders.length / Number(limit)),
      },
    });
  } catch (error) {
    throw new AppError('获取订单记录失败', 500);
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await storage.findSupplyChainOrder(req.params.id);
    if (!order) {
      throw new AppError('订单不存在', 404);
    }
    res.json({ success: true, data: order });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('获取订单记录失败', 500);
  }
});

export default router;

