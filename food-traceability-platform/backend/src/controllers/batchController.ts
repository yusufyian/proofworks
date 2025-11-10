import { Request, Response } from 'express';
import { FileStorage } from '../storage/fileStorage';

export const getBatches = (req: Request, res: Response) => {
  try {
    const { productId, status, startDate, endDate, page = '1', pageSize = '100' } = req.query;
    let batches = FileStorage.getBatches();
    
    if (productId) {
      batches = batches.filter(b => b.productId === productId);
    }
    
    if (status) {
      batches = batches.filter(b => b.status === status);
    }
    
    if (startDate) {
      batches = batches.filter(b => b.productionDate >= (startDate as string));
    }
    
    if (endDate) {
      batches = batches.filter(b => b.productionDate <= (endDate as string));
    }
    
    // 获取所有产品信息（一次性加载，避免N+1查询）
    const products = FileStorage.getProducts();
    const productMap = new Map(products.map(p => [p.id, p]));
    
    // 分页处理
    const pageNum = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);
    const total = batches.length;
    const start = (pageNum - 1) * size;
    const end = start + size;
    const paginatedBatches = batches.slice(start, end);
    
    // 为每个批次添加产品名称
    const batchesWithProducts = paginatedBatches.map(batch => {
      const product = productMap.get(batch.productId);
      return {
        ...batch,
        productName: product?.name || '未知产品'
      };
    });
    
    res.json({ 
      success: true, 
      data: batchesWithProducts, 
      total,
      page: pageNum,
      pageSize: size,
      totalPages: Math.ceil(total / size)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getBatch = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const batch = FileStorage.getBatch(id);
    
    if (!batch) {
      return res.status(404).json({ success: false, error: '批次不存在' });
    }
    
    res.json({ success: true, data: batch });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getBatchStatistics = (req: Request, res: Response) => {
  try {
    const batches = FileStorage.getBatches();
    const events = FileStorage.getEvents();
    
    const stats = {
      totalBatches: batches.length,
      byStatus: batches.reduce((acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCategory: batches.reduce((acc, b) => {
        const product = FileStorage.getProduct(b.productId);
        if (product) {
          acc[product.category] = (acc[product.category] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      totalEvents: events.length,
      recentBatches: batches
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
    };
    
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

