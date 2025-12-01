import { Response, NextFunction } from 'express';
import { storage } from '../storage/fileStorage';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const createTransfer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { certificateId, toCompanyId, amount, transferType } = req.body;

    if (!certificateId || !toCompanyId || !amount || !transferType) {
      throw new AppError('缺少必填字段', 400);
    }

    // 验证角色（只有供应商可以转让凭证）
    if (req.user!.role !== 'supplier') {
      throw new AppError('只有供应商可以转让凭证', 403);
    }

    // 查找凭证
    const certificate = await storage.findCertificate(certificateId);
    if (!certificate) {
      throw new AppError('凭证不存在', 404);
    }

    // 验证凭证持有人
    if (certificate.debtorId !== req.user!.companyId) {
      throw new AppError('您不是此凭证的持有人', 403);
    }

    // 验证凭证状态
    if (certificate.status !== 'holding') {
      throw new AppError('凭证状态不允许转让', 400);
    }

    // 验证金额
    if (transferType === 'split' && amount >= certificate.remainingAmount) {
      throw new AppError('拆分金额必须小于凭证剩余金额', 400);
    }

    if (transferType === 'full' && amount !== certificate.remainingAmount) {
      throw new AppError('全额转让金额必须等于凭证剩余金额', 400);
    }

    // 验证受让方
    const toCompany = await storage.findCompany({ id: toCompanyId });
    if (!toCompany || toCompany.type !== 'supplier') {
      throw new AppError('受让方不存在或类型不正确', 400);
    }

    // 防止自我转让
    if (toCompanyId === req.user!.companyId) {
      throw new AppError('不能转让给自己', 400);
    }

    // 创建转让记录
    const transfer = await storage.createTransfer({
      certificateId,
      fromCompanyId: req.user!.companyId,
      toCompanyId,
      amount: parseFloat(amount),
      transferType: transferType as 'full' | 'split',
      status: 'pending',
      blockchainTxHash: `tx_transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // 如果是全额转让，更新凭证状态
    if (transferType === 'full') {
      await storage.updateCertificate(certificateId, {
        status: 'transferred',
        debtorId: toCompanyId,
        remainingAmount: 0
      });
    } else {
      // 拆分转让：创建新凭证
      await storage.createCertificate({
        certificateNumber: `${certificate.certificateNumber}-S${Date.now()}`,
        originalCertificateId: certificate.id,
        creditorId: certificate.creditorId,
        debtorId: toCompanyId,
        initialAmount: parseFloat(amount),
        remainingAmount: parseFloat(amount),
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        status: 'holding',
        contractHash: certificate.contractHash,
        invoiceHash: certificate.invoiceHash,
        receiptHash: certificate.receiptHash,
        blockchainTxHash: `tx_split_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });

      // 更新原凭证
      await storage.updateCertificate(certificateId, {
        remainingAmount: certificate.remainingAmount - parseFloat(amount),
        status: 'split'
      });
    }

    logger.info(`转让申请创建成功: ${transfer.id}`, {
      transferId: transfer.id,
      certificateId,
      userId: req.user!.id
    });

    res.status(201).json({
      success: true,
      data: { transfer }
    });
  } catch (error) {
    next(error);
  }
};

export const getTransfers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const filter: any = {};

    if (search) {
      filter.search = search as string;
    }

    // 根据角色过滤
    if (req.user!.role === 'supplier') {
      // 供应商可以看到自己发起或接收的转让
      const allTransfers = await storage.findTransfers(search ? { search: search as string } : {});
      const userTransfers = allTransfers.filter(
        t => t.fromCompanyId === req.user!.companyId || t.toCompanyId === req.user!.companyId
      );
      
      let filtered = userTransfers;
      if (status) {
        filtered = filtered.filter(t => t.status === status);
      }

      // 填充关联信息
      for (const transfer of filtered) {
        transfer.certificate = await storage.findCertificate(transfer.certificateId);
        transfer.fromCompany = await storage.findCompany({ id: transfer.fromCompanyId });
        transfer.toCompany = await storage.findCompany({ id: transfer.toCompanyId });
      }

      // 分页
      const total = filtered.length;
      const offset = (pageNum - 1) * limitNum;
      const paginated = filtered.slice(offset, offset + limitNum);

      return res.json({
        success: true,
        data: {
          transfers: paginated,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    }

    if (status) {
      filter.status = status as string;
    }

    let transfers = await storage.findTransfers(filter);
    
    // 填充关联信息
    for (const transfer of transfers) {
      transfer.certificate = await storage.findCertificate(transfer.certificateId);
      transfer.fromCompany = await storage.findCompany({ id: transfer.fromCompanyId });
      transfer.toCompany = await storage.findCompany({ id: transfer.toCompanyId });
    }

    // 分页
    const total = transfers.length;
    const offset = (pageNum - 1) * limitNum;
    transfers = transfers.slice(offset, offset + limitNum);

    return res.json({
      success: true,
      data: {
        transfers,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const getTransferById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const transfer = await storage.findTransfer(id);
    if (!transfer) {
      throw new AppError('转让记录不存在', 404);
    }

    // 填充关联信息
    transfer.certificate = await storage.findCertificate(transfer.certificateId);
    transfer.fromCompany = await storage.findCompany({ id: transfer.fromCompanyId });
    transfer.toCompany = await storage.findCompany({ id: transfer.toCompanyId });

    res.json({
      success: true,
      data: { transfer }
    });
  } catch (error) {
    next(error);
  }
};

export const approveTransfer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const transfer = await storage.findTransfer(id);
    if (!transfer) {
      throw new AppError('转让记录不存在', 404);
    }

    if (transfer.status !== 'pending') {
      throw new AppError('转让记录状态不正确', 400);
    }

    const updated = await storage.updateTransfer(id, { status: 'completed' });

    res.json({
      success: true,
      data: { transfer: updated }
    });
  } catch (error) {
    next(error);
  }
};

export const rejectTransfer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const transfer = await storage.findTransfer(id);
    if (!transfer) {
      throw new AppError('转让记录不存在', 404);
    }

    if (transfer.status !== 'pending') {
      throw new AppError('转让记录状态不正确', 400);
    }

    const updated = await storage.updateTransfer(id, {
      status: 'rejected',
      reason: reason || '转让被拒绝'
    });

    res.json({
      success: true,
      data: { transfer: updated }
    });
  } catch (error) {
    next(error);
  }
};
