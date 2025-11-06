import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';
import { storage } from '../storage/fileStorage';

const JWT_SECRET = process.env.JWT_SECRET || 'carbon-esg-secret-key-change-in-production';

export async function register(req: AuthRequest, res: Response) {
  try {
    const { email, password, name, role, companyId } = req.body;

    console.log('注册请求:', { email, name, role, hasPassword: !!password });

    if (!email || !password || !name || !role) {
      const missing = [];
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      if (!name) missing.push('name');
      if (!role) missing.push('role');
      return res.status(400).json({ error: `缺少必要字段: ${missing.join(', ')}` });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '邮箱格式不正确' });
    }

    // 验证角色
    const validRoles = ['enterprise', 'supplier', 'verifier', 'regulator'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `角色无效，必须是以下之一: ${validRoles.join(', ')}` });
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
      role,
      companyId,
    });

    console.log(`注册成功: ${email}`);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
      token,
    });
  } catch (error: any) {
    console.error('注册错误:', error);
    res.status(500).json({ error: error.message || '注册失败，请稍后重试' });
  }
}

export async function login(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }

    console.log(`登录尝试: ${email}`);

    const user = await storage.findUser({ email });
    if (!user) {
      console.log(`用户不存在: ${email}`);
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    console.log(`找到用户: ${user.email}, 开始验证密码...`);
    const isValid = await bcrypt.compare(password, user.password);
    console.log(`密码验证结果: ${isValid}`);
    
    if (!isValid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`登录成功: ${email}`);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
      token,
    });
  } catch (error: any) {
    console.error('登录错误:', error);
    res.status(500).json({ error: error.message || '登录失败，请稍后重试' });
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未授权' });
    }

    const user = await storage.findUser({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

