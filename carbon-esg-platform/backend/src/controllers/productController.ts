import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { storage } from '../storage/fileStorage';

export async function getProductFootprints(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未授权' });
    }

    const companyId = req.user.companyId;
    const { verified } = req.query;

    const products = await storage.findProductCarbonFootprints({
      companyId,
      verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
    });

    res.json({ data: products });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getProductFootprint(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const product = await storage.findProductCarbonFootprint(id);

    if (!product) {
      return res.status(404).json({ error: '产品碳足迹不存在' });
    }

    if (req.user && product.companyId !== req.user.companyId) {
      return res.status(403).json({ error: '无权访问' });
    }

    res.json({ data: product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createProductFootprint(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未授权' });
    }

    const {
      productId,
      productName,
      functionalUnit,
      stages,
      verified,
    } = req.body;

    const lcaResult = Object.values(stages || {}).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);

    // 根据碳足迹值分级
    let carbonLabel: 'A' | 'B' | 'C' | undefined;
    if (lcaResult < 50) carbonLabel = 'A';
    else if (lcaResult < 100) carbonLabel = 'B';
    else carbonLabel = 'C';

    const product = await storage.createProductCarbonFootprint({
      productId,
      productName,
      companyId: req.user.companyId!,
      functionalUnit,
      lcaResult,
      stages: stages || {
        rawMaterial: 0,
        manufacturing: 0,
        transportation: 0,
        use: 0,
        disposal: 0,
      },
      carbonLabel,
      verified: verified || false,
    });

    res.status(201).json({ data: product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateProductFootprint(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const product = await storage.findProductCarbonFootprint(id);

    if (!product) {
      return res.status(404).json({ error: '产品碳足迹不存在' });
    }

    if (req.user && product.companyId !== req.user.companyId) {
      return res.status(403).json({ error: '无权访问' });
    }

    const updates = req.body;
    if (updates.stages) {
      const lcaResult = Object.values(updates.stages).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
      updates.lcaResult = lcaResult;
      
      // 重新计算碳标签
      if (lcaResult < 50) updates.carbonLabel = 'A';
      else if (lcaResult < 100) updates.carbonLabel = 'B';
      else updates.carbonLabel = 'C';
    }

    const updated = await storage.updateProductCarbonFootprint(id, updates);
    res.json({ data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

