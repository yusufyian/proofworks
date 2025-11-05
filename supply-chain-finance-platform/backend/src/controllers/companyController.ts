import { Response, NextFunction } from 'express';
import { storage } from '../storage/fileStorage';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getCompanies = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;
    
    let companies = await storage.findAllCompanies();
    
    // 根据类型过滤
    if (type) {
      companies = companies.filter(c => c.type === type);
    }
    
    res.json({
      success: true,
      data: { companies }
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const company = await storage.findCompany({ id });
    if (!company) {
      throw new AppError('公司不存在', 404);
    }
    
    res.json({
      success: true,
      data: { company }
    });
  } catch (error) {
    next(error);
  }
};

