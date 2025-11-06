import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import fileStorage from '../storage/fileStorage';
import { createBlockchainRecord } from '../utils/blockchain';
import logger from '../utils/logger';
import { Equipment } from '../types';
import dayjs from 'dayjs';

export const getEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const { category, status, workshop, page = 1, limit = 20, search } = req.query;
    let equipment = fileStorage.getEquipment();

    // 筛选
    if (category) {
      equipment = equipment.filter(eq => eq.category === category);
    }
    if (status) {
      equipment = equipment.filter(eq => eq.status === status);
    }
    if (workshop) {
      equipment = equipment.filter(eq => eq.location.workshop === workshop);
    }
    if (search) {
      const searchStr = String(search).toLowerCase();
      equipment = equipment.filter(eq =>
        eq.name.toLowerCase().includes(searchStr) ||
        eq.equipmentNo.toLowerCase().includes(searchStr) ||
        eq.model.toLowerCase().includes(searchStr)
      );
    }

    // 分页
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = equipment.slice(start, end);

    res.json({
      equipment: paginated,
      total: equipment.length,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error: any) {
    logger.error('Get equipment error:', error);
    res.status(500).json({ error: '获取设备列表失败' });
  }
};

export const getEquipmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const equipment = fileStorage.getEquipment();
    const eq = equipment.find(e => e.id === id);

    if (!eq) {
      return res.status(404).json({ error: '设备不存在' });
    }

    res.json(eq);
  } catch (error: any) {
    logger.error('Get equipment by id error:', error);
    res.status(500).json({ error: '获取设备详情失败' });
  }
};

export const createEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const equipment = fileStorage.getEquipment();
    // 提取所有设备编号中的数字部分，获取最大值
    let maxNo = 0;
    if (equipment.length > 0) {
      equipment.forEach(eq => {
        const match = eq.equipmentNo.match(/(\d+)$/); // 匹配末尾的数字
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNo) {
            maxNo = num;
          }
        }
      });
    }
    
    const newEq: Equipment = {
      id: crypto.randomUUID(),
      equipmentNo: `EQ-${String(maxNo + 1).padStart(4, '0')}`,
      name: req.body.name,
      model: req.body.model,
      serialNumber: req.body.serialNumber,
      category: req.body.category,
      supplier: req.body.supplier,
      purchaseDate: req.body.purchaseDate,
      purchasePrice: req.body.purchasePrice,
      status: 'normal',
      location: req.body.location,
      responsibility: req.body.responsibility,
      technicalParams: req.body.technicalParams,
      healthScore: 100,
      runtimeHours: 0,
      workCycles: 0,
      qrCode: `EQUIP-${maxNo + 1}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 区块链存证
    const bcRecord = createBlockchainRecord('equipment', newEq.id, {
      equipmentNo: newEq.equipmentNo,
      name: newEq.name,
      purchaseDate: newEq.purchaseDate,
      supplier: newEq.supplier,
    });
    newEq.blockchainHash = bcRecord.dataHash;

    // 保存区块链记录
    const bcRecords = fileStorage.getBlockchainRecords();
    bcRecords.push(bcRecord);
    fileStorage.saveBlockchainRecords(bcRecords);

    equipment.push(newEq);
    fileStorage.saveEquipment(equipment);

    res.status(201).json(newEq);
  } catch (error: any) {
    logger.error('Create equipment error:', error);
    res.status(500).json({ error: '创建设备失败' });
  }
};

export const updateEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const equipment = fileStorage.getEquipment();
    const index = equipment.findIndex(e => e.id === id);

    if (index === -1) {
      return res.status(404).json({ error: '设备不存在' });
    }

    equipment[index] = {
      ...equipment[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    fileStorage.saveEquipment(equipment);
    res.json(equipment[index]);
  } catch (error: any) {
    logger.error('Update equipment error:', error);
    res.status(500).json({ error: '更新设备失败' });
  }
};

export const getEquipmentStats = async (req: AuthRequest, res: Response) => {
  try {
    const equipment = fileStorage.getEquipment();
    const workOrders = fileStorage.getWorkOrders();
    
    const stats = {
      total: equipment.length,
      byStatus: {
        normal: equipment.filter(e => e.status === 'normal').length,
        maintenance: equipment.filter(e => e.status === 'maintenance').length,
        repair: equipment.filter(e => e.status === 'repair').length,
        scrapped: equipment.filter(e => e.status === 'scrapped').length,
      },
      byCategory: equipment.reduce((acc: any, eq) => {
        acc[eq.category] = (acc[eq.category] || 0) + 1;
        return acc;
      }, {}),
      avgHealthScore: Math.round(
        equipment.reduce((sum, eq) => sum + (eq.healthScore || 0), 0) / equipment.length
      ),
      activeWorkOrders: workOrders.filter(wo => 
        ['pending', 'assigned', 'in_progress'].includes(wo.status)
      ).length,
    };

    res.json(stats);
  } catch (error: any) {
    logger.error('Get equipment stats error:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
};