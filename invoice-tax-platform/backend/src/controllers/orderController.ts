import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import storage from '../storage/fileStorage';

export async function getOrders(req: AuthRequest, res: Response) {
  try {
    const { supplierId, buyerId, status, search, page = 1, limit = 20 } = req.query;

    const filter: any = {};
    if (supplierId) filter.supplierId = supplierId;
    if (buyerId) filter.buyerId = buyerId;
    if (status) filter.status = status;
    if (search) filter.search = search;

    const orders = await storage.findPurchaseOrders(filter);
    const total = orders.length;
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginatedOrders = orders.slice(start, end);

    res.json({
      data: paginatedOrders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: '获取订单列表失败' });
  }
}

export async function getOrder(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const order = await storage.findPurchaseOrder(id);
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    res.json({ data: order });
  } catch (error: any) {
    res.status(500).json({ error: '获取订单详情失败' });
  }
}

export async function getReceipts(req: AuthRequest, res: Response) {
  try {
    const { orderId, supplierId, status } = req.query;

    const filter: any = {};
    if (orderId) filter.orderId = orderId;
    if (supplierId) filter.supplierId = supplierId;
    if (status) filter.status = status;

    const receipts = await storage.findReceipts(filter);
    res.json({ data: receipts });
  } catch (error: any) {
    res.status(500).json({ error: '获取入库单列表失败' });
  }
}

