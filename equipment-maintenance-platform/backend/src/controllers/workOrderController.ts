import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import fileStorage from '../storage/fileStorage';
import { createBlockchainRecord } from '../utils/blockchain';
import logger from '../utils/logger';
import { WorkOrder } from '../types';
import dayjs from 'dayjs';

export const getWorkOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, type, priority, page = 1, limit = 20 } = req.query;
    let orders = fileStorage.getWorkOrders();

    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    if (type) {
      orders = orders.filter(o => o.type === type);
    }
    if (priority) {
      orders = orders.filter(o => o.priority === priority);
    }

    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = orders.slice(start, end);

    res.json({
      orders: paginated,
      total: orders.length,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error: any) {
    logger.error('Get work orders error:', error);
    res.status(500).json({ error: '获取工单列表失败' });
  }
};

export const getWorkOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orders = fileStorage.getWorkOrders();
    const order = orders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({ error: '工单不存在' });
    }

    res.json(order);
  } catch (error: any) {
    logger.error('Get work order by id error:', error);
    res.status(500).json({ error: '获取工单详情失败' });
  }
};

export const createWorkOrder = async (req: AuthRequest, res: Response) => {
  try {
    const equipment = fileStorage.getEquipment();
    const eq = equipment.find(e => e.id === req.body.equipmentId);

    if (!eq) {
      return res.status(404).json({ error: '设备不存在' });
    }

    const orders = fileStorage.getWorkOrders();
    const today = dayjs().format('YYYYMMDD');
    const todayOrders = orders.filter(o => o.orderNo.includes(today));
    const orderNo = `WO-${today}-${String(todayOrders.length + 1).padStart(4, '0')}`;

    const order: WorkOrder = {
      id: crypto.randomUUID(),
      orderNo,
      equipmentId: req.body.equipmentId,
      equipmentNo: eq.equipmentNo,
      equipmentName: eq.name,
      type: req.body.type,
      priority: req.body.priority || 'normal',
      status: 'pending',
      reportedBy: req.user!.id,
      reportedAt: new Date().toISOString(),
      faultDescription: req.body.faultDescription,
      faultPhenomenon: req.body.faultPhenomenon,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(order);
    fileStorage.saveWorkOrders(orders);

    // 更新设备状态
    eq.status = 'repair';
    fileStorage.saveEquipment(equipment);

    res.status(201).json(order);
  } catch (error: any) {
    logger.error('Create work order error:', error);
    res.status(500).json({ error: '创建工单失败' });
  }
};

export const updateWorkOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orders = fileStorage.getWorkOrders();
    const index = orders.findIndex(o => o.id === id);

    if (index === -1) {
      return res.status(404).json({ error: '工单不存在' });
    }

    const wasCompleted = orders[index].status === 'completed';
    orders[index] = {
      ...orders[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    // 如果工单完成，添加区块链存证
    if (orders[index].status === 'completed' && !wasCompleted) {
      const bcRecord = createBlockchainRecord('repair', orders[index].id, {
        orderNo: orders[index].orderNo,
        equipmentNo: orders[index].equipmentNo,
        repairActions: orders[index].repairActions,
        cost: orders[index].cost,
        downtimeHours: orders[index].downtimeHours,
      });
      orders[index].blockchainHash = bcRecord.dataHash;

      const bcRecords = fileStorage.getBlockchainRecords();
      bcRecords.push(bcRecord);
      fileStorage.saveBlockchainRecords(bcRecords);

      // 更新设备状态
      const equipment = fileStorage.getEquipment();
      const eq = equipment.find(e => e.id === orders[index].equipmentId);
      if (eq) {
        eq.status = 'normal';
        fileStorage.saveEquipment(equipment);
      }
    }

    fileStorage.saveWorkOrders(orders);
    res.json(orders[index]);
  } catch (error: any) {
    logger.error('Update work order error:', error);
    res.status(500).json({ error: '更新工单失败' });
  }
};