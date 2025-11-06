import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { storage } from '../storage/fileStorage';

export async function getSupplierCarbonData(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未授权' });
    }

    const { supplierId } = req.query;
    const data = await storage.findSupplierCarbonData({
      supplierId: supplierId as string,
      buyerId: req.user.companyId,
    });

    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createSupplierCarbonData(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未授权' });
    }

    const data = await storage.createSupplierCarbonData({
      ...req.body,
      buyerId: req.user.companyId!,
    });

    res.status(201).json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

