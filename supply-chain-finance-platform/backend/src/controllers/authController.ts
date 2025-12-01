import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { storage } from '../storage/fileStorage';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, phone, companyName, unifiedSocialCreditCode, companyType, role } = req.body;

    // 验证必填字段
    if (!email || !password || !name || !companyName || !unifiedSocialCreditCode || !role) {
      throw new AppError('缺少必填字段', 400);
    }

    // 检查用户是否已存在
    const existingUser = await storage.findUser({ email });
    if (existingUser) {
      throw new AppError('该邮箱已被注册', 400);
    }

    // 检查公司是否已存在
    let company = await storage.findCompany({ unifiedSocialCreditCode });
    
    if (!company) {
      // 创建新公司
      company = await storage.createCompany({
        name: companyName,
        unifiedSocialCreditCode,
        type: companyType || (role === 'core_enterprise' ? 'core_enterprise' : 'supplier'),
        status: 'active'
      });
    }

    // 创建用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      companyId: company.id,
      role: role as any,
      name,
      phone,
      status: 'active'
    });

    // 生成JWT token
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      {
        id: user.id,
        companyId: user.companyId,
        role: user.role,
        email: user.email
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyName: company.name
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('请提供邮箱和密码', 400);
    }

    // 查找用户
    const user = await storage.findUser({ email });
    if (!user) {
      throw new AppError('邮箱或密码错误', 401);
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('邮箱或密码错误', 401);
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw new AppError('账户已被禁用', 403);
    }

    // 获取公司信息
    const company = await storage.findCompany({ id: user.companyId });

    // 生成JWT token
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      {
        id: user.id,
        companyId: user.companyId,
        role: user.role,
        email: user.email
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyName: company?.name
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await storage.findUser({ id: req.user!.id });
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    const company = await storage.findCompany({ id: user.companyId });
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          company: company || null
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phone } = req.body;
    const user = await storage.updateUser(req.user!.id, { name, phone });

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    next(error);
  }
};
