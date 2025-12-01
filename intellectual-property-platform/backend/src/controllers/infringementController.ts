import express, { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import fileStorage from '../storage/fileStorage';
import { InfringementCase } from '../types';
import { generateEvidenceHash, generateTxHash, generateBlockHeight } from '../utils/blockchain';

export const infringementController = {
  getAll: async (req: express.Request, res: Response) => {
    try {
      const { page = 1, pageSize = 20, status, platform } = req.query;
      let infringements = fileStorage.getInfringements();
      const assets = fileStorage.getAssets();
      
      // 填充资产信息
      infringements = infringements.map(inf => ({
        ...inf,
        asset: assets.find(a => a.id === inf.assetId) || inf.asset,
      }));
      
      if (status) {
        infringements = infringements.filter(i => i.status === status);
      }
      
      if (platform) {
        infringements = infringements.filter(i => i.suspectPlatform === platform);
      }
      
      const start = (Number(page) - 1) * Number(pageSize);
      const end = start + Number(pageSize);
      
      res.json({
        data: infringements.slice(start, end),
        total: infringements.length,
        page: Number(page),
        pageSize: Number(pageSize),
      });
    } catch (error) {
      res.status(500).json({ error: '获取侵权案例失败' });
    }
  },

  getById: async (req: express.Request, res: Response) => {
    try {
      const infringements = fileStorage.getInfringements();
      const assets = fileStorage.getAssets();
      const infringement = infringements.find(i => i.id === req.params.id);
      
      if (!infringement) {
        return res.status(404).json({ error: '侵权案例不存在' });
      }
      
      infringement.asset = assets.find(a => a.id === infringement.assetId) || infringement.asset;
      
      res.json({ data: infringement });
    } catch (error) {
      res.status(500).json({ error: '获取侵权案例详情失败' });
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      const {
        assetId,
        suspectUrl,
        suspectPlatform,
        similarity,
        evidence,
      } = req.body;
      
      const assets = fileStorage.getAssets();
      const asset = assets.find(a => a.id === assetId);
      
      if (!asset) {
        return res.status(404).json({ error: '资产不存在' });
      }
      
      const createdAt = new Date().toISOString();
      
      const infringement: InfringementCase = {
        id: uuidv4(),
        assetId,
        asset: asset!,
        suspectUrl,
        suspectPlatform,
        similarity: similarity || Math.floor(Math.random() * 25) + 75,
        evidence: evidence || {
          screenshots: [],
          sourceCode: '',
          productInfo: {
            seller: '',
            sales: 0,
            price: 0,
          },
        },
        blockchain: {
          evidenceHash: generateEvidenceHash({ assetId, suspectUrl }),
          txHash: generateTxHash(),
          blockHeight: generateBlockHeight(),
        },
        status: 'monitoring',
        createdAt,
        updatedAt: createdAt,
      };
      
      const infringements = fileStorage.getInfringements();
      infringements.push(infringement);
      fileStorage.saveInfringements(infringements);
      
      res.status(201).json({ data: infringement });
    } catch (error) {
      res.status(500).json({ error: '创建侵权案例失败' });
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      const infringements = fileStorage.getInfringements();
      const index = infringements.findIndex(i => i.id === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ error: '侵权案例不存在' });
      }
      
      infringements[index] = {
        ...infringements[index],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      fileStorage.saveInfringements(infringements);
      
      res.json({ data: infringements[index] });
    } catch (error) {
      res.status(500).json({ error: '更新侵权案例失败' });
    }
  },

  getByAsset: async (req: express.Request, res: Response) => {
    try {
      const infringements = fileStorage.getInfringements();
      const assetInfringements = infringements.filter(i => i.assetId === req.params.assetId);
      const assets = fileStorage.getAssets();
      
      const result = assetInfringements.map(inf => ({
        ...inf,
        asset: assets.find(a => a.id === inf.assetId) || inf.asset,
      }));
      
      res.json({ data: result });
    } catch (error) {
      res.status(500).json({ error: '获取资产侵权案例失败' });
    }
  },
};

