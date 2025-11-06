import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fileStorage from '../storage/fileStorage';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'equipment-maintenance-secret-key-2024';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const users = fileStorage.getUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({ error: '登录失败' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const users = fileStorage.getUsers();
    const user = users.find(u => u.id === req.user?.id);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
};