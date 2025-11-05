import { Request, Response } from 'express';
import { FileStorage } from '../storage/fileStorage';

export const getDashboardStats = (req: Request, res: Response) => {
  try {
    const products = FileStorage.getProducts();
    const batches = FileStorage.getBatches();
    const events = FileStorage.getEvents();
    const iotData = FileStorage.getIoTData();
    const recalls = FileStorage.getRecalls();
    
    // 按状态统计批次
    const batchStatusStats = batches.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 按类别统计产品
    const productCategoryStats = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 召回统计
    const recallStats = recalls.reduce((acc, r) => {
      acc[r.riskLevel] = (acc[r.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 最近7天的事件趋势
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEvents = events.filter(e => new Date(e.timestamp) >= sevenDaysAgo);
    
    const dailyEvents = recentEvents.reduce((acc, e) => {
      const date = e.timestamp.split(' ')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const stats = {
      overview: {
        totalProducts: products.length,
        totalBatches: batches.length,
        totalEvents: events.length,
        totalIoTData: iotData.length,
        activeRecalls: recalls.filter(r => r.status === '进行中').length
      },
      batchStatus: batchStatusStats,
      productCategory: productCategoryStats,
      recallStats: recallStats,
      dailyEvents: dailyEvents,
      recentBatches: batches
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(b => {
          const product = FileStorage.getProduct(b.productId);
          return {
            ...b,
            productName: product?.name || '未知'
          };
        })
    };
    
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

