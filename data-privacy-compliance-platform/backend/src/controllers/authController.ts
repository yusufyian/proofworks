import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { getStorage, updateStorage } from '../storage/fileStorage';
import { AppError } from '../middleware/errorHandler';
import { User } from '../types';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, organization, role } = req.body;

    if (!email || !password || !name || !organization || !role) {
      throw new AppError('缺少必填字段', 400);
    }

    const storage = getStorage();
    const existingUser = storage.users.find(u => u.email === email);
    if (existingUser) {
      throw new AppError('该邮箱已被注册', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      password: hashedPassword,
      name,
      organization,
      role: role as User['role'],
      createdAt: new Date().toISOString(),
    };

    updateStorage(storage => {
      storage.users.push(newUser);
      return storage;
    });

    const jwtSecret: string = process.env.JWT_SECRET || 'secret';
    const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d';
    const signOptions: SignOptions = { expiresIn: expiresIn as any };
    const token = jwt.sign(
      {
        id: newUser.id,
        role: newUser.role,
        email: newUser.email,
        name: newUser.name,
        organization: newUser.organization,
      },
      jwtSecret,
      signOptions
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          organization: newUser.organization,
          role: newUser.role,
        },
      },
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

    const storage = getStorage();
    const user = storage.users.find(u => u.email === email);
    if (!user) {
      throw new AppError('邮箱或密码错误', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('邮箱或密码错误', 401);
    }

    const jwtSecret: string = process.env.JWT_SECRET || 'secret';
    const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d';
    const signOptions: SignOptions = { expiresIn: expiresIn as any };
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        organization: user.organization,
      },
      jwtSecret,
      signOptions
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          organization: user.organization,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storage = getStorage();
    const userId = (req as any).user?.id;
    const user = storage.users.find(u => u.id === userId);
    
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        organization: user.organization,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

