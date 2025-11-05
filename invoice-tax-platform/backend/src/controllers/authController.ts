import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { generateToken } from '../middleware/auth';
import storage from '../storage/fileStorage';
import { logger } from '../utils/logger';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name, role, department, companyId } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const existingUser = await storage.findUser({ email });
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      name,
      role: role || 'employee',
      department,
      companyId
    });

    const token = generateToken(user.id);

    logger.info(`新用户注册: ${user.email}`);

    res.status(201).json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department
        },
        token
      }
    });
  } catch (error: any) {
    logger.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '请输入邮箱和密码' });
    }

    const user = await storage.findUser({ email });
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const token = generateToken(user.id);

    logger.info(`用户登录: ${user.email}`);

    res.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          companyId: user.companyId
        },
        token
      }
    });
  } catch (error: any) {
    logger.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: '未授权' });
    }

    const user = await storage.findUser({ id: userId });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        companyId: user.companyId
      }
    });
  } catch (error: any) {
    logger.error('获取用户信息失败:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
}

