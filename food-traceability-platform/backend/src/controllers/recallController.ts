import { Request, Response } from 'express';
import { FileStorage } from '../storage/fileStorage';

export const getRecalls = (req: Request, res: Response) => {
  try {
    const { status, riskLevel } = req.query;
    let recalls = FileStorage.getRecalls();
    
    if (status) {
      recalls = recalls.filter(r => r.status === status);
    }
    
    if (riskLevel) {
      recalls = recalls.filter(r => r.riskLevel === riskLevel);
    }
    
    res.json({ success: true, data: recalls, total: recalls.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getRecall = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const recall = FileStorage.getRecall(id);
    
    if (!recall) {
      return res.status(404).json({ success: false, error: '召回记录不存在' });
    }
    
    res.json({ success: true, data: recall });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

