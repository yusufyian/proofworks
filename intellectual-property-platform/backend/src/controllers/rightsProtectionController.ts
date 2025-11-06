import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import fileStorage from '../storage/fileStorage';
import { RightsProtection } from '../types';

export const rightsProtectionController = {
  getAll: async (req: express.Request, res: Response) => {
    try {
      const { page = 1, pageSize = 20, status } = req.query;
      let protections = fileStorage.getRightsProtections();
      const infringements = fileStorage.getInfringements();
      const assets = fileStorage.getAssets();
      
      // 填充关联数据
      protections = protections.map(prot => {
        const inf = infringements.find(i => i.id === prot.caseId);
        return {
          ...prot,
          infringementCase: inf ? {
            ...inf,
            asset: assets.find(a => a.id === inf.assetId) || inf.asset,
          } : prot.infringementCase,
        };
      });
      
      if (status) {
        protections = protections.filter(p => p.status === status);
      }
      
      const start = (Number(page) - 1) * Number(pageSize);
      const end = start + Number(pageSize);
      
      res.json({
        data: protections.slice(start, end),
        total: protections.length,
        page: Number(page),
        pageSize: Number(pageSize),
      });
    } catch (error) {
      res.status(500).json({ error: '获取维权记录失败' });
    }
  },

  getById: async (req: express.Request, res: Response) => {
    try {
      const protections = fileStorage.getRightsProtections();
      const infringements = fileStorage.getInfringements();
      const assets = fileStorage.getAssets();
      const protection = protections.find(p => p.id === req.params.id);
      
      if (!protection) {
        return res.status(404).json({ error: '维权记录不存在' });
      }
      
      const inf = infringements.find(i => i.id === protection.caseId);
      protection.infringementCase = inf ? {
        ...inf,
        asset: assets.find(a => a.id === inf.assetId) || inf.asset,
      } : protection.infringementCase;
      
      res.json({ data: protection });
    } catch (error) {
      res.status(500).json({ error: '获取维权记录详情失败' });
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      const {
        caseId,
        evidence,
      } = req.body;
      
      const infringements = fileStorage.getInfringements();
      const infringement = infringements.find(i => i.id === caseId);
      
      if (!infringement) {
        return res.status(404).json({ error: '侵权案例不存在' });
      }
      
      const createdAt = new Date().toISOString();
      
      const protection: RightsProtection = {
        id: uuidv4(),
        caseId,
        infringementCase: infringement,
        applicantId: req.user!.id,
        evidence: evidence || {
          originalCertificate: infringement.asset.certificateId,
          infringementEvidence: '',
          economicLoss: 0,
        },
        status: 'submitted',
        createdAt,
        updatedAt: createdAt,
      };
      
      const protections = fileStorage.getRightsProtections();
      protections.push(protection);
      fileStorage.saveRightsProtections(protections);
      
      res.status(201).json({ data: protection });
    } catch (error) {
      res.status(500).json({ error: '创建维权记录失败' });
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      const protections = fileStorage.getRightsProtections();
      const index = protections.findIndex(p => p.id === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ error: '维权记录不存在' });
      }
      
      protections[index] = {
        ...protections[index],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      fileStorage.saveRightsProtections(protections);
      
      res.json({ data: protections[index] });
    } catch (error) {
      res.status(500).json({ error: '更新维权记录失败' });
    }
  },
};

