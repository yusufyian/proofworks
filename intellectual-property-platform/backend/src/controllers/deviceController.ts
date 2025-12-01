import express, { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { AuthRequest } from '../middleware/auth';
import fileStorage from '../storage/fileStorage';
import { Device } from '../types';

export const deviceController = {
  getAll: async (req: express.Request, res: Response) => {
    try {
      const { page = 1, pageSize = 20, status, assetType } = req.query;
      let devices = fileStorage.getDevices();
      
      if (status) {
        devices = devices.filter(d => d.status === status);
      }
      
      if (assetType) {
        devices = devices.filter(d => d.assetType === assetType);
      }
      
      const start = (Number(page) - 1) * Number(pageSize);
      const end = start + Number(pageSize);
      
      res.json({
        data: devices.slice(start, end),
        total: devices.length,
        page: Number(page),
        pageSize: Number(pageSize),
      });
    } catch (error) {
      res.status(500).json({ error: '获取设备列表失败' });
    }
  },

  getById: async (req: express.Request, res: Response) => {
    try {
      const devices = fileStorage.getDevices();
      const device = devices.find(d => d.id === req.params.id);
      
      if (!device) {
        return res.status(404).json({ error: '设备不存在' });
      }
      
      res.json({ data: device });
    } catch (error) {
      res.status(500).json({ error: '获取设备详情失败' });
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      const {
        assetType,
        name,
        serialNumber,
        manufacturer,
        purchaseDate,
        originalValue,
        location,
        metadata,
      } = req.body;
      
      const num = Math.floor(Math.random() * 9999) + 1;
      const tokenId = `DEVICE-${dayjs().format('YYYYMMDD')}-${String(num).padStart(4, '0')}`;
      const createdAt = purchaseDate || new Date().toISOString();
      
      const device: Device = {
        id: uuidv4(),
        tokenId,
        assetType: assetType || '生产设备',
        name,
        serialNumber,
        manufacturer,
        purchaseDate,
        originalValue,
        location: location || '未指定',
        status: 'normal',
        owner: req.user!.id,
        metadata: metadata || {},
        images: [],
        documents: [],
        createdAt,
        updatedAt: createdAt,
      };
      
      const devices = fileStorage.getDevices();
      devices.push(device);
      fileStorage.saveDevices(devices);
      
      res.status(201).json({ data: device });
    } catch (error) {
      res.status(500).json({ error: '创建设备失败' });
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      const devices = fileStorage.getDevices();
      const index = devices.findIndex(d => d.id === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ error: '设备不存在' });
      }
      
      if (devices[index].owner !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ error: '无权修改此设备' });
      }
      
      devices[index] = {
        ...devices[index],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      fileStorage.saveDevices(devices);
      
      res.json({ data: devices[index] });
    } catch (error) {
      res.status(500).json({ error: '更新设备失败' });
    }
  },
};

