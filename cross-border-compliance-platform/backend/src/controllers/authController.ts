import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '../storage/fileStorage';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('邮箱和密码不能为空', 400);
    }

    const user = await storage.findUser({ email });
    if (!user) {
      throw new AppError('邮箱或密码错误', 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AppError('邮箱或密码错误', 401);
    }

    if (user.status !== 'active') {
      throw new AppError('账户已被禁用', 403);
    }

    const token = jwt.sign(
      {
        id: user.id,
        companyId: user.companyId,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    const company = await storage.findCompany({ id: user.companyId });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          company: company ? {
            id: company.id,
            name: company.name,
            type: company.type,
            region: company.region,
          } : null,
        },
      },
    });
  } catch (error) {
    logger.error('登录失败:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('登录失败', 500);
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await storage.findUser({ id: req.user!.id });
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    const company = await storage.findCompany({ id: user.companyId });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          company: company ? {
            id: company.id,
            name: company.name,
            type: company.type,
            region: company.region,
          } : null,
        },
      },
    });
  } catch (error) {
    logger.error('获取用户信息失败:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('获取用户信息失败', 500);
  }
};

