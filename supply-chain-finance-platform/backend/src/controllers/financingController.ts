import { Response, NextFunction } from 'express';
import { storage } from '../storage/fileStorage';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

// 风控评分计算
function calculateRiskScore(
  coreEnterpriseRating: string,
  certificateValid: boolean,
  supplierRating: string,
  historicalPerformance: number
): { score: number; rating: string; financingRatio: number } {
  const coreEnterpriseScore = getRatingScore(coreEnterpriseRating) * 0.4;
  const certificateScore = certificateValid ? 30 : 0;
  const supplierScore = getRatingScore(supplierRating) * 0.2;
  const performanceScore = historicalPerformance * 0.1;
  
  const totalScore = coreEnterpriseScore + certificateScore + supplierScore + performanceScore;
  
  let rating: string;
  let financingRatio: number;
  
  if (totalScore >= 90) {
    rating = 'AAA';
    financingRatio = 0.8;
  } else if (totalScore >= 80) {
    rating = 'AA';
    financingRatio = 0.7;
  } else if (totalScore >= 70) {
    rating = 'A';
    financingRatio = 0.6;
  } else if (totalScore >= 60) {
    rating = 'BBB';
    financingRatio = 0.5;
  } else {
    rating = 'REJECTED';
    financingRatio = 0;
  }
  
  return { score: totalScore, rating, financingRatio };
}

function getRatingScore(rating: string): number {
  const ratingMap: { [key: string]: number } = {
    'AAA': 100, 'AA': 85, 'A': 75, 'BBB': 65, 'BB': 55, 'B': 45, 'C': 35
  };
  return ratingMap[rating] || 50;
}

export const createFinancing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { certificateId, financierId, amount, term } = req.body;

    if (!certificateId || !financierId || !amount || !term) {
      throw new AppError('缺少必填字段', 400);
    }

    if (req.user!.role !== 'supplier') {
      throw new AppError('只有供应商可以申请融资', 403);
    }

    const certificate = await storage.findCertificate(certificateId);
    if (!certificate) {
      throw new AppError('凭证不存在', 404);
    }

    if (certificate.debtorId !== req.user!.companyId) {
      throw new AppError('您不是此凭证的持有人', 403);
    }

    if (certificate.status !== 'holding') {
      throw new AppError('凭证状态不允许融资', 400);
    }

    if (amount > certificate.remainingAmount) {
      throw new AppError('融资金额不能超过凭证剩余金额', 400);
    }

    const financier = await storage.findCompany({ id: financierId });
    if (!financier || financier.type !== 'bank') {
      throw new AppError('融资方不存在或类型不正确', 400);
    }

    // 获取债权人信息
    const creditor = await storage.findCompany({ id: certificate.creditorId });

    // 风控评估
    const riskAssessment = calculateRiskScore(
      creditor?.creditRating || 'BBB',
      true,
      financier?.creditRating || 'BBB',
      0.85
    );

    if (riskAssessment.rating === 'REJECTED') {
      throw new AppError('风控评估未通过', 400);
    }

    const suggestedAmount = certificate.remainingAmount * riskAssessment.financingRatio;
    if (amount > suggestedAmount) {
      throw new AppError(`融资金额超过风控建议额度（${suggestedAmount.toFixed(2)}）`, 400);
    }

    const interestRate = riskAssessment.rating === 'AAA' ? 4.5 :
                         riskAssessment.rating === 'AA' ? 5.0 :
                         riskAssessment.rating === 'A' ? 5.5 : 6.0;

    const financing = await storage.createFinancing({
      certificateId,
      applicantId: req.user!.companyId,
      financierId,
      amount: parseFloat(amount),
      interestRate,
      term: parseInt(term),
      status: 'pending',
      riskScore: riskAssessment.score,
      riskRating: riskAssessment.rating
    });

    logger.info(`融资申请创建成功: ${financing.id}`, {
      financingId: financing.id,
      certificateId,
      userId: req.user!.id
    });

    res.status(201).json({
      success: true,
      data: { financing, riskAssessment }
    });
  } catch (error) {
    next(error);
  }
};

export const getFinancings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const filter: any = {};

    if (req.user!.role === 'supplier') {
      filter.applicantId = req.user!.companyId;
    } else if (req.user!.role === 'bank') {
      filter.financierId = req.user!.companyId;
    }

    if (status) {
      filter.status = status as string;
    }

    if (search) {
      filter.search = search as string;
    }

    let financings = await storage.findFinancings(filter);
    
    // 填充关联信息
    for (const financing of financings) {
      financing.certificate = await storage.findCertificate(financing.certificateId);
      financing.applicant = await storage.findCompany({ id: financing.applicantId });
      financing.financier = await storage.findCompany({ id: financing.financierId });
    }

    // 分页
    const total = financings.length;
    const offset = (pageNum - 1) * limitNum;
    financings = financings.slice(offset, offset + limitNum);

    res.json({
      success: true,
      data: {
        financings,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getFinancingById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const financing = await storage.findFinancing(id);
    if (!financing) {
      throw new AppError('融资记录不存在', 404);
    }

    // 填充关联信息
    financing.certificate = await storage.findCertificate(financing.certificateId);
    financing.applicant = await storage.findCompany({ id: financing.applicantId });
    financing.financier = await storage.findCompany({ id: financing.financierId });

    res.json({
      success: true,
      data: { financing }
    });
  } catch (error) {
    next(error);
  }
};

export const approveFinancing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (req.user!.role !== 'bank') {
      throw new AppError('只有银行可以审批融资', 403);
    }

    const financing = await storage.findFinancing(id);
    if (!financing) {
      throw new AppError('融资记录不存在', 404);
    }

    if (financing.status !== 'pending') {
      throw new AppError('融资记录状态不正确', 400);
    }

    const updated = await storage.updateFinancing(id, {
      status: 'approved',
      approvalDate: new Date().toISOString()
    });

    res.json({
      success: true,
      data: { financing: updated }
    });
  } catch (error) {
    next(error);
  }
};

export const rejectFinancing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (req.user!.role !== 'bank') {
      throw new AppError('只有银行可以拒绝融资', 403);
    }

    const financing = await storage.findFinancing(id);
    if (!financing) {
      throw new AppError('融资记录不存在', 404);
    }

    if (financing.status !== 'pending') {
      throw new AppError('融资记录状态不正确', 400);
    }

    const updated = await storage.updateFinancing(id, { status: 'rejected' });

    res.json({
      success: true,
      data: { financing: updated }
    });
  } catch (error) {
    next(error);
  }
};

export const disburseFinancing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { paymentTxHash } = req.body;

    if (req.user!.role !== 'bank') {
      throw new AppError('只有银行可以放款', 403);
    }

    const financing = await storage.findFinancing(id);
    if (!financing) {
      throw new AppError('融资记录不存在', 404);
    }

    if (financing.status !== 'approved') {
      throw new AppError('融资记录状态不正确', 400);
    }

    // 更新融资状态
    const updated = await storage.updateFinancing(id, {
      status: 'disbursed',
      disbursementDate: new Date().toISOString(),
      paymentTxHash: paymentTxHash || `tx_disburse_${Date.now()}`
    });

    // 更新凭证状态为已质押
    await storage.updateCertificate(financing.certificateId, { status: 'pledged' });

    logger.info(`融资放款成功: ${financing.id}`, {
      financingId: financing.id,
      userId: req.user!.id
    });

    res.json({
      success: true,
      data: { financing: updated }
    });
  } catch (error) {
    next(error);
  }
};
