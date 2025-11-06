import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { storage } from '../storage/fileStorage';

export async function getStats(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未授权' });
    }

    const companyId = req.user.companyId;

    // 获取最近的碳盘查
    const inventories = await storage.findCarbonInventories({ companyId });
    const latestInventory = inventories[0];
    
    // 获取产品碳足迹
    const products = await storage.findProductCarbonFootprints({ companyId });
    
    // 获取减排项目
    const projects = await storage.findReductionProjects({ companyId });
    
    // 获取ESG报告
    const reports = await storage.findESGReports({ companyId });

    // 计算统计信息
    const stats = {
      totalEmissions: latestInventory?.totalEmissions || 0,
      scope1Emissions: latestInventory?.scope1Emissions || 0,
      scope2Emissions: latestInventory?.scope2Emissions || 0,
      scope3Emissions: latestInventory?.scope3Emissions || 0,
      totalProducts: products.length,
      verifiedProducts: products.filter(p => p.verified).length,
      totalProjects: projects.length,
      certifiedProjects: projects.filter(p => p.status === 'certified' || p.status === 'trading').length,
      totalReduction: projects.reduce((sum, p) => sum + (p.reductionAmount || 0), 0),
      totalReports: reports.length,
      publishedReports: reports.filter(r => r.status === 'published').length,
      // 趋势数据
      trend7Days: generateTrendData(7),
      trend30Days: generateTrendData(30),
    };

    res.json({ data: stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

function generateTrendData(days: number) {
  const data = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      emissions: Math.floor(Math.random() * 5000) + 10000,
      reduction: Math.floor(Math.random() * 500) + 1000,
    });
  }
  return data;
}

