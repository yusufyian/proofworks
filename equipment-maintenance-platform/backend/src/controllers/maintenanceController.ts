import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import fileStorage from '../storage/fileStorage';
import logger from '../utils/logger';
import { MaintenancePlan } from '../types';
import dayjs from 'dayjs';

export const getMaintenancePlans = async (req: AuthRequest, res: Response) => {
  try {
    const { status, equipmentId, page = 1, limit = 20 } = req.query;
    let plans = fileStorage.getMaintenancePlans();

    if (status) {
      plans = plans.filter(p => p.status === status);
    }
    if (equipmentId) {
      plans = plans.filter(p => p.equipmentId === equipmentId);
    }

    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = plans.slice(start, end);

    res.json({
      plans: paginated,
      total: plans.length,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error: any) {
    logger.error('Get maintenance plans error:', error);
    res.status(500).json({ error: '获取维保计划失败' });
  }
};

export const createMaintenancePlan = async (req: AuthRequest, res: Response) => {
  try {
    const equipment = fileStorage.getEquipment();
    const eq = equipment.find(e => e.id === req.body.equipmentId);
    
    if (!eq) {
      return res.status(404).json({ error: '设备不存在' });
    }

    const plans = fileStorage.getMaintenancePlans();
    const plan: MaintenancePlan = {
      id: crypto.randomUUID(),
      equipmentId: req.body.equipmentId,
      equipmentNo: eq.equipmentNo,
      equipmentName: eq.name,
      planType: req.body.planType || 'preventive',
      maintenanceType: req.body.maintenanceType,
      cycleDays: req.body.cycleDays,
      cycleHours: req.body.cycleHours,
      cycleCount: req.body.cycleCount,
      lastMaintenanceDate: req.body.lastMaintenanceDate,
      nextMaintenanceDate: req.body.nextMaintenanceDate,
      tasks: req.body.tasks,
      status: 'scheduled',
      assignedTo: req.body.assignedTo,
      createdAt: new Date().toISOString(),
    };

    plans.push(plan);
    fileStorage.saveMaintenancePlans(plans);

    res.status(201).json(plan);
  } catch (error: any) {
    logger.error('Create maintenance plan error:', error);
    res.status(500).json({ error: '创建维保计划失败' });
  }
};

export const updateMaintenancePlan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const plans = fileStorage.getMaintenancePlans();
    const index = plans.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: '维保计划不存在' });
    }

    plans[index] = { ...plans[index], ...req.body };
    fileStorage.saveMaintenancePlans(plans);

    res.json(plans[index]);
  } catch (error: any) {
    logger.error('Update maintenance plan error:', error);
    res.status(500).json({ error: '更新维保计划失败' });
  }
};