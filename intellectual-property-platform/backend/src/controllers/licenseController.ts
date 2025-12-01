import express, { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { AuthRequest } from '../middleware/auth';
import fileStorage from '../storage/fileStorage';
import { License } from '../types';
import { generateTxHash, generateBlockHeight } from '../utils/blockchain';

export const licenseController = {
  getAll: async (req: express.Request, res: Response) => {
    try {
      const { page = 1, pageSize = 20, status, licenseType } = req.query;
      let licenses = fileStorage.getLicenses();
      const assets = fileStorage.getAssets();
      
      // 填充资产信息
      licenses = licenses.map(lic => ({
        ...lic,
        asset: assets.find(a => a.id === lic.assetId) || lic.asset,
      }));
      
      if (status) {
        licenses = licenses.filter(l => l.status === status);
      }
      
      if (licenseType) {
        licenses = licenses.filter(l => l.licenseType === licenseType);
      }
      
      const start = (Number(page) - 1) * Number(pageSize);
      const end = start + Number(pageSize);
      
      res.json({
        data: licenses.slice(start, end),
        total: licenses.length,
        page: Number(page),
        pageSize: Number(pageSize),
      });
    } catch (error) {
      res.status(500).json({ error: '获取授权列表失败' });
    }
  },

  getById: async (req: express.Request, res: Response) => {
    try {
      const licenses = fileStorage.getLicenses();
      const assets = fileStorage.getAssets();
      const license = licenses.find(l => l.id === req.params.id);
      
      if (!license) {
        return res.status(404).json({ error: '授权不存在' });
      }
      
      license.asset = assets.find(a => a.id === license.assetId) || license.asset;
      
      res.json({ data: license });
    } catch (error) {
      res.status(500).json({ error: '获取授权详情失败' });
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      const {
        assetId,
        licenseeId,
        licenseType,
        price,
        duration,
        scope,
      } = req.body;
      
      const assets = fileStorage.getAssets();
      const asset = assets.find(a => a.id === assetId);
      
      if (!asset) {
        return res.status(404).json({ error: '资产不存在' });
      }
      
      if (asset.ownerId !== req.user!.id) {
        return res.status(403).json({ error: '无权授权此资产' });
      }
      
      const createdAt = new Date().toISOString();
      
      const license: License = {
        id: uuidv4(),
        assetId,
        asset: asset!,
        licensorId: req.user!.id,
        licenseeId,
        licenseType,
        price,
        duration,
        scope: scope || '全球',
        nftTokenId: `NFT-${Math.floor(Math.random() * 1000000)}`,
        status: 'listed',
        blockchain: {
          txHash: generateTxHash(),
          blockHeight: generateBlockHeight(),
        },
        createdAt,
        expiresAt: dayjs(createdAt).add(duration, 'years').toISOString(),
      };
      
      const licenses = fileStorage.getLicenses();
      licenses.push(license);
      fileStorage.saveLicenses(licenses);
      
      res.status(201).json({ data: license });
    } catch (error) {
      res.status(500).json({ error: '创建授权失败' });
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      const licenses = fileStorage.getLicenses();
      const index = licenses.findIndex(l => l.id === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ error: '授权不存在' });
      }
      
      licenses[index] = {
        ...licenses[index],
        ...req.body,
      };
      fileStorage.saveLicenses(licenses);
      
      res.json({ data: licenses[index] });
    } catch (error) {
      res.status(500).json({ error: '更新授权失败' });
    }
  },
};

