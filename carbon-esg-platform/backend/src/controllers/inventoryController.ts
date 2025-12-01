import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { storage } from '../storage/fileStorage';
import { mockBlockchainCertify } from '../utils/blockchain';

export async function getInventories(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未授权' });
    }

    const companyId = req.user.companyId;
    const { period, status } = req.query;

    const inventories = await storage.findCarbonInventories({
      companyId,
      period: period as string,
      status: status as string,
    });

    res.json({ data: inventories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getInventory(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const inventory = await storage.findCarbonInventory(id);

    if (!inventory) {
      return res.status(404).json({ error: '碳盘查记录不存在' });
    }

    if (req.user && inventory.companyId !== req.user.companyId) {
      return res.status(403).json({ error: '无权访问' });
    }

    res.json({ data: inventory });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createInventory(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未授权' });
    }

    const {
      period,
      scope1Emissions,
      scope2Emissions,
      scope3Emissions,
      status,
    } = req.body;

    const totalEmissions = (scope1Emissions || 0) + (scope2Emissions || 0) + (scope3Emissions || 0);

    const inventoryData: {
      companyId: string;
      period: any;
      scope1Emissions: any;
      scope2Emissions: any;
      scope3Emissions: any;
      totalEmissions: any;
      status: any;
      blockchainHash?: string;
    } = {
      companyId: req.user.companyId!,
      period,
      scope1Emissions: scope1Emissions || 0,
      scope2Emissions: scope2Emissions || 0,
      scope3Emissions: scope3Emissions || 0,
      totalEmissions,
      status: status || 'draft',
    };

    // 如果是已认证或已核证状态，自动上链存证
    if (status === 'certified' || status === 'verified') {
      const blockchainData = mockBlockchainCertify(inventoryData);
      inventoryData.blockchainHash = blockchainData.transactionHash;
    }

    const inventory = await storage.createCarbonInventory(inventoryData as any);

    res.status(201).json({ data: inventory });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateInventory(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const inventory = await storage.findCarbonInventory(id);

    if (!inventory) {
      return res.status(404).json({ error: '碳盘查记录不存在' });
    }

    if (req.user && inventory.companyId !== req.user.companyId) {
      return res.status(403).json({ error: '无权访问' });
    }

    const updates = req.body;
    if (updates.scope1Emissions !== undefined || updates.scope2Emissions !== undefined || updates.scope3Emissions !== undefined) {
      const scope1 = updates.scope1Emissions ?? inventory.scope1Emissions;
      const scope2 = updates.scope2Emissions ?? inventory.scope2Emissions;
      const scope3 = updates.scope3Emissions ?? inventory.scope3Emissions;
      updates.totalEmissions = scope1 + scope2 + scope3;
    }

    const updated = await storage.updateCarbonInventory(id, updates);
    res.json({ data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getActivityData(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未授权' });
    }

    const { period } = req.query;
    const activityData = await storage.findActivityData({
      companyId: req.user.companyId!,
      period: period as string,
    });

    res.json({ data: activityData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createActivityData(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未授权' });
    }

    const activityData = await storage.createActivityData({
      companyId: req.user.companyId!,
      ...req.body,
    });

    res.status(201).json({ data: activityData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

