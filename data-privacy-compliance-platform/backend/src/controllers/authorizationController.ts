import { Request, Response, NextFunction } from 'express';
import { getStorage, updateStorage } from '../storage/fileStorage';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { Authorization, AuthorizationStatus } from '../types';

export const getAuthorizations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const storage = getStorage();
    const userId = req.user?.id;
    const { page = 1, limit = 20, status } = req.query;

    let authorizations = storage.authorizations;

    // 根据角色过滤
    if (req.user?.role === 'data_provider') {
      authorizations = authorizations.filter(a => a.grantor === userId);
    } else if (req.user?.role === 'data_consumer') {
      authorizations = authorizations.filter(a => a.grantee === userId);
    }

    // 状态过滤
    if (status) {
      authorizations = authorizations.filter(a => a.status === status);
    }

    // 分页
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = authorizations.slice(start, end);

    // 填充关联数据
    const enriched = paginated.map(auth => {
      const grantor = storage.users.find(u => u.id === auth.grantor);
      const grantee = storage.users.find(u => u.id === auth.grantee);
      const asset = storage.dataAssets.find(a => a.id === auth.dataAssetId);
      return {
        ...auth,
        grantorName: grantor?.name,
        grantorOrg: grantor?.organization,
        granteeName: grantee?.name,
        granteeOrg: grantee?.organization,
        assetName: asset?.name,
        assetCategory: asset?.category,
      };
    });

    res.json({
      success: true,
      data: {
        items: enriched,
        total: authorizations.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(authorizations.length / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createAuthorization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { dataAssetId, purpose, fields, dataScope, validTo, usageLimit, resultType } = req.body;
    const userId = req.user?.id;

    if (!dataAssetId || !purpose || !fields || !dataScope || !validTo) {
      throw new AppError('缺少必填字段', 400);
    }

    const storage = getStorage();
    const asset = storage.dataAssets.find(a => a.id === dataAssetId);
    if (!asset) {
      throw new AppError('数据资产不存在', 404);
    }

    // 只有数据提供方可以创建授权
    if (req.user?.role !== 'data_provider' || asset.owner !== userId) {
      throw new AppError('无权创建授权', 403);
    }

    const validFrom = new Date().toISOString();
    const newAuth: Authorization = {
      id: `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      grantor: userId!,
      grantee: req.body.grantee,
      dataAssetId,
      purpose,
      fields: Array.isArray(fields) ? fields : [fields],
      dataScope,
      validFrom,
      validTo,
      usageLimit,
      resultType: resultType || 'aggregated_only',
      status: 'pending',
      createdAt: validFrom,
    };

    updateStorage(storage => {
      storage.authorizations.push(newAuth);
      return storage;
    });

    res.status(201).json({
      success: true,
      data: newAuth,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAuthorizationStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!['approved', 'rejected', 'revoked'].includes(status)) {
      throw new AppError('无效的状态', 400);
    }

    const storage = getStorage();
    const auth = storage.authorizations.find(a => a.id === id);
    if (!auth) {
      throw new AppError('授权记录不存在', 404);
    }

    // 只有授权方可以审批
    if (auth.grantor !== userId && req.user?.role !== 'admin') {
      throw new AppError('无权操作此授权', 403);
    }

    updateStorage(storage => {
      const index = storage.authorizations.findIndex(a => a.id === id);
      if (index !== -1) {
        storage.authorizations[index] = {
          ...storage.authorizations[index],
          status: status as AuthorizationStatus,
          approvedAt: status === 'approved' ? new Date().toISOString() : undefined,
          blockchainHash: status === 'approved' ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined,
        };
      }
      return storage;
    });

    res.json({
      success: true,
      data: storage.authorizations.find(a => a.id === id),
    });
  } catch (error) {
    next(error);
  }
};

