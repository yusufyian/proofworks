import { Request, Response, NextFunction } from 'express';
import { getStorage } from '../storage/fileStorage';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getDataAssets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const storage = getStorage();
    const userId = req.user?.id;
    const { page = 1, limit = 20, category, classification } = req.query;

    let assets = storage.dataAssets;

    // 数据提供方只能看到自己的资产
    if (req.user?.role === 'data_provider') {
      assets = assets.filter(a => a.owner === userId);
    }

    // 过滤
    if (category) {
      assets = assets.filter(a => a.category === category);
    }
    if (classification) {
      assets = assets.filter(a => a.classification === Number(classification));
    }

    // 分页
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginatedAssets = assets.slice(start, end);

    res.json({
      success: true,
      data: {
        items: paginatedAssets,
        total: assets.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(assets.length / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDataAsset = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const storage = getStorage();
    const { id } = req.params;
    const userId = req.user?.id;

    const asset = storage.dataAssets.find(a => a.id === id);
    if (!asset) {
      throw new AppError('数据资产不存在', 404);
    }

    // 数据提供方只能查看自己的资产
    if (req.user?.role === 'data_provider' && asset.owner !== userId) {
      throw new AppError('无权访问此资产', 403);
    }

    res.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

