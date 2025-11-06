import { Response } from 'express';
import dayjs from 'dayjs';
import { AuthRequest } from '../middleware/auth';
import fileStorage from '../storage/fileStorage';

export const dashboardController = {
  getStats: async (req: AuthRequest, res: Response) => {
    try {
      const assets = fileStorage.getAssets();
      const infringements = fileStorage.getInfringements();
      const rightsProtections = fileStorage.getRightsProtections();
      const licenses = fileStorage.getLicenses();
      const devices = fileStorage.getDevices();
      
      const userAssets = assets.filter(a => a.ownerId === req.user!.id);
      const userInfringements = infringements.filter(i => i.asset.ownerId === req.user!.id);
      const userProtections = rightsProtections.filter(p => p.applicantId === req.user!.id);
      const userLicenses = licenses.filter(l => l.licensorId === req.user!.id || l.licenseeId === req.user!.id);
      
      // 生成趋势数据（最近30天）
      const trend30Days = [];
      for (let i = 29; i >= 0; i--) {
        const date = dayjs().subtract(i, 'days').format('YYYY-MM-DD');
        const dayAssets = userAssets.filter(a => dayjs(a.createdAt).format('YYYY-MM-DD') === date);
        trend30Days.push({
          date,
          count: dayAssets.length,
          amount: dayAssets.reduce((sum, a) => sum + a.fileSize, 0),
        });
      }
      
      // 生成趋势数据（最近7天）
      const trend7Days = trend30Days.slice(-7);
      
      // 状态分布
      const statusDistribution = {
        registered: userAssets.filter(a => a.status === 'registered').length,
        licensed: userAssets.filter(a => a.status === 'licensed').length,
        transferred: userAssets.filter(a => a.status === 'transferred').length,
        expired: userAssets.filter(a => a.status === 'expired').length,
      };
      
      res.json({
        data: {
          totalAssets: userAssets.length,
          totalInfringements: userInfringements.length,
          pendingInfringements: userInfringements.filter(i => i.status === 'pending' || i.status === 'investigating').length,
          totalProtections: userProtections.length,
          activeProtections: userProtections.filter(p => ['submitted', 'lawyer_reviewing', 'notary_applied', 'letter_sent'].includes(p.status)).length,
          totalLicenses: userLicenses.length,
          activeLicenses: userLicenses.filter(l => l.status === 'active').length,
          totalDevices: devices.filter(d => d.owner === req.user!.id).length,
          trend7Days,
          trend30Days,
          statusDistribution,
        },
      });
    } catch (error) {
      res.status(500).json({ error: '获取统计数据失败' });
    }
  },
};

