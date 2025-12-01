import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import fileStorage from '../storage/fileStorage';
import logger from '../utils/logger';
import { SparePart } from '../types';

export const getSpareParts = async (req: AuthRequest, res: Response) => {
  try {
    const { category, abcClass, lowStock, page = 1, limit = 20, search } = req.query;
    let parts = fileStorage.getSpareParts();

    if (category) {
      parts = parts.filter(p => p.category === category);
    }
    if (abcClass) {
      parts = parts.filter(p => p.abcClass === abcClass);
    }
    if (lowStock === 'true') {
      parts = parts.filter(p => p.currentStock <= p.minStock);
    }
    if (search) {
      const searchStr = String(search).toLowerCase();
      parts = parts.filter(p =>
        p.name.toLowerCase().includes(searchStr) ||
        p.partNo.toLowerCase().includes(searchStr) ||
        p.model.toLowerCase().includes(searchStr)
      );
    }

    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = parts.slice(start, end);

    res.json({
      parts: paginated,
      total: parts.length,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error: any) {
    logger.error('Get spare parts error:', error);
    res.status(500).json({ error: '获取备件列表失败' });
  }
};

export const getSparePart = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parts = fileStorage.getSpareParts();
    const part = parts.find(p => p.id === id);

    if (!part) {
      return res.status(404).json({ error: '备件不存在' });
    }

    res.json(part);
  } catch (error: any) {
    logger.error('Get spare part error:', error);
    res.status(500).json({ error: '获取备件详情失败' });
  }
};

export const createSparePart = async (req: AuthRequest, res: Response) => {
  try {
    const parts = fileStorage.getSpareParts();
    const maxNo = Math.max(...parts.map(p => parseInt(p.partNo.split('-')[2] || '0')), 0);

    const part: SparePart = {
      id: crypto.randomUUID(),
      partNo: `SP-${String(Math.floor(maxNo / 100) + 1).padStart(2, '0')}-${String(maxNo % 100 + 1).padStart(3, '0')}`,
      name: req.body.name,
      model: req.body.model,
      category: req.body.category,
      unit: req.body.unit,
      currentStock: req.body.currentStock || 0,
      minStock: req.body.minStock,
      safeStock: req.body.safeStock,
      maxStock: req.body.maxStock,
      unitPrice: req.body.unitPrice,
      supplier: req.body.supplier,
      applicableEquipment: req.body.applicableEquipment,
      abcClass: req.body.abcClass || 'B',
      location: req.body.location,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    parts.push(part);
    fileStorage.saveSpareParts(parts);

    res.status(201).json(part);
  } catch (error: any) {
    logger.error('Create spare part error:', error);
    res.status(500).json({ error: '创建备件失败' });
  }
};

export const updateSparePart = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parts = fileStorage.getSpareParts();
    const index = parts.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: '备件不存在' });
    }

    parts[index] = {
      ...parts[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    fileStorage.saveSpareParts(parts);
    res.json(parts[index]);
  } catch (error: any) {
    logger.error('Update spare part error:', error);
    res.status(500).json({ error: '更新备件失败' });
  }
};