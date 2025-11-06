import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import fileStorage from '../storage/fileStorage';
import logger from '../utils/logger';
import dayjs from 'dayjs';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const equipment = fileStorage.getEquipment();
    const workOrders = fileStorage.getWorkOrders();
    const maintenancePlans = fileStorage.getMaintenancePlans();
    const spareParts = fileStorage.getSpareParts();
    const healthAssessments = fileStorage.getHealthAssessments();

    // 设备统计
    const equipmentStats = {
      total: equipment.length,
      normal: equipment.filter(e => e.status === 'normal').length,
      maintenance: equipment.filter(e => e.status === 'maintenance').length,
      repair: equipment.filter(e => e.status === 'repair').length,
      scrapped: equipment.filter(e => e.status === 'scrapped').length,
      avgHealthScore: Math.round(
        equipment.reduce((sum, e) => sum + (e.healthScore || 0), 0) / equipment.length || 0
      ),
    };

    // 工单统计
    const workOrderStats = {
      total: workOrders.length,
      pending: workOrders.filter(o => o.status === 'pending').length,
      inProgress: workOrders.filter(o => o.status === 'in_progress').length,
      completed: workOrders.filter(o => o.status === 'completed').length,
      urgent: workOrders.filter(o => o.priority === 'urgent').length,
      todayCompleted: workOrders.filter(o => {
        if (o.status !== 'completed' || !o.endTime) return false;
        return dayjs(o.endTime).isSame(dayjs(), 'day');
      }).length,
    };

    // 维保计划统计
    const maintenanceStats = {
      total: maintenancePlans.length,
      scheduled: maintenancePlans.filter(p => p.status === 'scheduled').length,
      overdue: maintenancePlans.filter(p => p.status === 'overdue').length,
      dueIn7Days: maintenancePlans.filter(p => {
        const dueDate = dayjs(p.nextMaintenanceDate);
        return dueDate.diff(dayjs(), 'days') <= 7 && dueDate.diff(dayjs(), 'days') > 0;
      }).length,
    };

    // 备件统计
    const sparePartsStats = {
      total: spareParts.length,
      lowStock: spareParts.filter(p => p.currentStock <= p.minStock).length,
      totalValue: spareParts.reduce((sum, p) => sum + p.currentStock * p.unitPrice, 0),
    };

    // 健康度统计
    const recentAssessments = healthAssessments
      .filter(a => dayjs(a.assessmentDate).diff(dayjs(), 'days') >= -7)
      .slice(0, 10);
    
    const healthStats = {
      excellent: equipment.filter(e => (e.healthScore || 0) >= 90).length,
      good: equipment.filter(e => (e.healthScore || 0) >= 70 && (e.healthScore || 0) < 90).length,
      fair: equipment.filter(e => (e.healthScore || 0) >= 50 && (e.healthScore || 0) < 70).length,
      poor: equipment.filter(e => (e.healthScore || 0) < 50).length,
      recentAssessments,
    };

    res.json({
      equipment: equipmentStats,
      workOrders: workOrderStats,
      maintenance: maintenanceStats,
      spareParts: sparePartsStats,
      health: healthStats,
    });
  } catch (error: any) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({ error: '获取仪表盘数据失败' });
  }
};