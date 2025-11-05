import { Response, NextFunction } from 'express';
import { storage } from '../storage/fileStorage';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

// 生成凭证编号
function generateCertificateNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SCF-${timestamp}-${random}`;
}

export const createCertificate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      debtorId,
      initialAmount,
      expiryDate,
      contractHash,
      invoiceHash,
      receiptHash
    } = req.body;

    // 验证必填字段
    if (!debtorId || !initialAmount || !expiryDate) {
      throw new AppError('缺少必填字段：债务人ID、金额、到期日', 400);
    }

    // 验证角色（只有核心企业可以签发凭证）
    if (req.user!.role !== 'core_enterprise') {
      throw new AppError('只有核心企业可以签发凭证', 403);
    }

    // 验证债务人是否存在
    const debtor = await storage.findCompany({ id: debtorId });
    if (!debtor) {
      logger.error(`债务人不存在: ${debtorId}`, {
        debtorId,
        userId: req.user!.id,
        availableCompanies: (await storage.findAllCompanies()).map(c => ({ id: c.id, name: c.name, type: c.type }))
      });
      throw new AppError(`债务人不存在（ID: ${debtorId}）`, 400);
    }
    if (debtor.type !== 'supplier') {
      logger.error(`债务人类型不正确: ${debtor.type}`, {
        debtorId,
        debtorType: debtor.type,
        debtorName: debtor.name
      });
      throw new AppError(`债务人类型不正确，必须是供应商类型（当前类型: ${debtor.type}）`, 400);
    }

    // 验证金额
    if (initialAmount <= 0) {
      throw new AppError('凭证金额必须大于0', 400);
    }

    // 创建凭证
    const certificate = await storage.createCertificate({
      certificateNumber: generateCertificateNumber(),
      creditorId: req.user!.companyId,
      debtorId,
      initialAmount: parseFloat(initialAmount),
      remainingAmount: parseFloat(initialAmount),
      issueDate: new Date().toISOString(),
      expiryDate: new Date(expiryDate).toISOString(),
      status: 'holding',
      contractHash,
      invoiceHash,
      receiptHash,
      signature: `signature_${Date.now()}`,
      blockchainTxHash: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    logger.info(`凭证创建成功: ${certificate.certificateNumber}`, {
      certificateId: certificate.id,
      userId: req.user!.id
    });

    res.status(201).json({
      success: true,
      data: { certificate }
    });
  } catch (error) {
    next(error);
  }
};

export const getCertificates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const filter: any = {};

    // 根据角色过滤
    if (req.user!.role === 'core_enterprise') {
      filter.creditorId = req.user!.companyId;
    } else if (req.user!.role === 'supplier') {
      filter.debtorId = req.user!.companyId;
    }

    if (status) {
      filter.status = status as string;
    }

    if (search) {
      filter.search = search as string;
    }

    let certificates = await storage.findCertificates(filter);
    
    // 填充关联的公司信息
    for (const cert of certificates) {
      cert.creditor = await storage.findCompany({ id: cert.creditorId });
      cert.debtor = await storage.findCompany({ id: cert.debtorId });
    }

    // 分页
    const total = certificates.length;
    const offset = (pageNum - 1) * limitNum;
    certificates = certificates.slice(offset, offset + limitNum);

    res.json({
      success: true,
      data: {
        certificates,
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

export const getCertificateById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const certificate = await storage.findCertificate(id);
    if (!certificate) {
      throw new AppError('凭证不存在', 404);
    }

    // 权限检查
    const hasAccess = certificate.creditorId === req.user!.companyId ||
                      certificate.debtorId === req.user!.companyId ||
                      req.user!.role === 'admin' ||
                      req.user!.role === 'bank';

    if (!hasAccess) {
      throw new AppError('无权访问此凭证', 403);
    }

    // 填充关联信息
    certificate.creditor = await storage.findCompany({ id: certificate.creditorId });
    certificate.debtor = await storage.findCompany({ id: certificate.debtorId });

    res.json({
      success: true,
      data: { certificate }
    });
  } catch (error) {
    next(error);
  }
};

export const getCertificateHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const certificate = await storage.findCertificate(id);
    if (!certificate) {
      throw new AppError('凭证不存在', 404);
    }

    // 获取转让历史
    const transfers = await storage.findTransfers({});
    const certificateTransfers = transfers
      .filter(t => t.certificateId === id)
      .map(async (t) => {
        t.fromCompany = await storage.findCompany({ id: t.fromCompanyId });
        t.toCompany = await storage.findCompany({ id: t.toCompanyId });
        return t;
      });

    const resolvedTransfers = await Promise.all(certificateTransfers);

    res.json({
      success: true,
      data: {
        certificate,
        transfers: resolvedTransfers
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyCertificate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { certificateNumber, blockchainTxHash } = req.body;

    let certificate = null;
    if (id) {
      certificate = await storage.findCertificate(id);
    } else if (certificateNumber) {
      const certificates = await storage.findCertificates({});
      certificate = certificates.find(c => c.certificateNumber === certificateNumber) || null;
    } else if (blockchainTxHash) {
      const certificates = await storage.findCertificates({});
      certificate = certificates.find(c => c.blockchainTxHash === blockchainTxHash) || null;
    }

    if (!certificate) {
      throw new AppError('凭证不存在或验证失败', 404);
    }

    // 填充关联信息
    certificate.creditor = await storage.findCompany({ id: certificate.creditorId });
    certificate.debtor = await storage.findCompany({ id: certificate.debtorId });

    // 验证凭证状态
    const isValid = certificate.status !== 'redeemed' &&
                    new Date(certificate.expiryDate) > new Date() &&
                    certificate.remainingAmount > 0;

    res.json({
      success: true,
      data: {
        certificate,
        isValid,
        verification: {
          exists: true,
          status: certificate.status,
          notExpired: new Date(certificate.expiryDate) > new Date(),
          hasBalance: certificate.remainingAmount > 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
