import { Response } from 'express';
import storage from '../storage/fileStorage';
import dayjs from 'dayjs';

function getLastNDays(n: number) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
  }
  return days;
}

export const getStats = async (req: any, res: Response) => {
  try {
    const batches = await storage.findBatches();
    const devices = await storage.findDevices();
    const alerts = await storage.findAlerts();
    const transports = await storage.findTransports();
    const temperatureData = await storage.findTemperatureData({});

    // 基础统计
    const totalBatches = batches.length;
    const activeBatches = batches.filter(b => ['in_storage', 'in_transit'].includes(b.status)).length;
    const onlineDevices = devices.filter(d => d.status === 'online').length;
    const pendingAlerts = alerts.filter(a => a.status === 'pending').length;
    const inTransitTransports = transports.filter(t => t.status === 'in_transit').length;

    // 合规率计算
    const compliantBatches = batches.filter(b => {
      const batchData = temperatureData.filter(t => t.batchId === b.id);
      if (batchData.length === 0) return false;
      const violations = batchData.filter(t => 
        t.temperature < b.temperatureRange.min || t.temperature > b.temperatureRange.max
      );
      return violations.length / batchData.length < 0.005; // 99.5%合规率
    });
    const complianceRate = totalBatches > 0 ? (compliantBatches.length / totalBatches * 100).toFixed(2) : '100.00';

    // 告警统计
    const alertStats = {
      warning: alerts.filter(a => a.level === 'warning').length,
      serious: alerts.filter(a => a.level === 'serious').length,
      critical: alerts.filter(a => a.level === 'critical').length,
    };

    // 最近7天趋势
    const last7Days = getLastNDays(7);
    const trend7Days = last7Days.map(date => {
      const dayBatches = batches.filter(b => {
        const batchDate = dayjs(b.createdAt).format('YYYY-MM-DD');
        return batchDate === date;
      });
      const dayAlerts = alerts.filter(a => {
        const alertDate = dayjs(a.createdAt).format('YYYY-MM-DD');
        return alertDate === date;
      });
      return {
        date,
        batches: dayBatches.length,
        alerts: dayAlerts.length,
      };
    });

    // 最近30天趋势
    const last30Days = getLastNDays(30);
    const trend30Days = last30Days.map(date => {
      const dayBatches = batches.filter(b => {
        const batchDate = dayjs(b.createdAt).format('YYYY-MM-DD');
        return batchDate === date;
      });
      const dayAlerts = alerts.filter(a => {
        const alertDate = dayjs(a.createdAt).format('YYYY-MM-DD');
        return alertDate === date;
      });
      return {
        date,
        batches: dayBatches.length,
        alerts: dayAlerts.length,
      };
    });

    // 设备状态分布
    const deviceStatus = {
      online: devices.filter(d => d.status === 'online').length,
      offline: devices.filter(d => d.status === 'offline').length,
      maintenance: devices.filter(d => d.status === 'maintenance').length,
    };

    // 批次状态分布
    const batchStatus = {
      in_storage: batches.filter(b => b.status === 'in_storage').length,
      in_transit: batches.filter(b => b.status === 'in_transit').length,
      delivered: batches.filter(b => b.status === 'delivered').length,
      isolated: batches.filter(b => b.status === 'isolated').length,
    };

    res.json({
      success: true,
      data: {
        totalBatches,
        activeBatches,
        onlineDevices,
        totalDevices: devices.length,
        pendingAlerts,
        totalAlerts: alerts.length,
        inTransitTransports,
        totalTransports: transports.length,
        complianceRate,
        alertStats,
        deviceStatus,
        batchStatus,
        trend7Days,
        trend30Days,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 导出别名，兼容旧代码
export const getDashboardStats = getStats;
