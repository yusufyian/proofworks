import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { AuthRequest } from '../middleware/auth';
import fileStorage from '../storage/fileStorage';
import { Asset } from '../types';
import { generateTxHash, calculateFileHash, generateBlockHeight, generateCertificateId } from '../utils/blockchain';

export const assetController = {
  getAll: async (req: express.Request, res: Response) => {
    try {
      const { page = 1, pageSize = 20, assetType, status } = req.query;
      let assets = fileStorage.getAssets();
      
      if (assetType) {
        assets = assets.filter(a => a.assetType === assetType);
      }
      
      if (status) {
        assets = assets.filter(a => a.status === status);
      }
      
      const start = (Number(page) - 1) * Number(pageSize);
      const end = start + Number(pageSize);
      
      res.json({
        data: assets.slice(start, end),
        total: assets.length,
        page: Number(page),
        pageSize: Number(pageSize),
      });
    } catch (error) {
      res.status(500).json({ error: '获取资产列表失败' });
    }
  },

  getById: async (req: express.Request, res: Response) => {
    try {
      const assets = fileStorage.getAssets();
      const asset = assets.find(a => a.id === req.params.id);
      
      if (!asset) {
        return res.status(404).json({ error: '资产不存在' });
      }
      
      res.json({ data: asset });
    } catch (error) {
      res.status(500).json({ error: '获取资产详情失败' });
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      const {
        assetType,
        fileName,
        fileContent,
        description,
        tags,
        license = '保留所有权利',
      } = req.body;
      
      const users = fileStorage.getUsers();
      const user = users.find(u => u.id === req.user!.id);
      
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }
      
      const fileHash = calculateFileHash(fileContent || fileName);
      const createdAt = new Date().toISOString();
      
      const asset: Asset = {
        id: uuidv4(),
        certificateId: generateCertificateId(),
        assetType,
        fileName,
        fileHash: '0x' + fileHash,
        fileSize: (fileContent || '').length,
        author: {
          name: user.name,
          idCard: user.phone || undefined,
          ca_cert: `CA-${Math.floor(Math.random() * 1000000)}`,
        },
        timestamp: {
          tsa: '国家授时中心',
          time: createdAt,
          tsa_signature: generateTxHash(),
        },
        blockchain: {
          chain: 'Hyperledger Fabric',
          txHash: generateTxHash(),
          blockHeight: generateBlockHeight(),
          node: 'ip-registry-node1.example.com',
        },
        metadata: {
          description: description || fileName,
          tags: tags || [assetType],
          license,
        },
        ownerId: user.id,
        status: 'registered',
        createdAt,
      };
      
      const assets = fileStorage.getAssets();
      assets.push(asset);
      fileStorage.saveAssets(assets);
      
      res.status(201).json({ data: asset });
    } catch (error) {
      res.status(500).json({ error: '创建资产失败' });
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      const assets = fileStorage.getAssets();
      const index = assets.findIndex(a => a.id === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ error: '资产不存在' });
      }
      
      if (assets[index].ownerId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ error: '无权修改此资产' });
      }
      
      assets[index] = { ...assets[index], ...req.body };
      fileStorage.saveAssets(assets);
      
      res.json({ data: assets[index] });
    } catch (error) {
      res.status(500).json({ error: '更新资产失败' });
    }
  },

  delete: async (req: AuthRequest, res: Response) => {
    try {
      const assets = fileStorage.getAssets();
      const asset = assets.find(a => a.id === req.params.id);
      
      if (!asset) {
        return res.status(404).json({ error: '资产不存在' });
      }
      
      if (asset.ownerId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ error: '无权删除此资产' });
      }
      
      const filtered = assets.filter(a => a.id !== req.params.id);
      fileStorage.saveAssets(filtered);
      
      res.json({ message: '删除成功' });
    } catch (error) {
      res.status(500).json({ error: '删除资产失败' });
    }
  },

  getByOwner: async (req: express.Request, res: Response) => {
    try {
      const assets = fileStorage.getAssets();
      const ownerAssets = assets.filter(a => a.ownerId === req.params.ownerId);
      
      res.json({ data: ownerAssets });
    } catch (error) {
      res.status(500).json({ error: '获取用户资产失败' });
    }
  },
};

