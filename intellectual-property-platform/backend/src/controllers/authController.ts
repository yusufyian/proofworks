import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import fileStorage from '../storage/fileStorage';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authController = {
  login: async (req: express.Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      const users = fileStorage.getUsers();
      const user = users.find(u => u.username === username || u.email === username);
      
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
      
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          organization: user.organization,
        },
      });
    } catch (error) {
      res.status(500).json({ error: '登录失败' });
    }
  },

  register: async (req: express.Request, res: Response) => {
    try {
      const { username, email, password, name, role = 'creator', organization } = req.body;
      
      const users = fileStorage.getUsers();
      
      if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: '用户名已存在' });
      }
      
      if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: '邮箱已存在' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser: User = {
        id: uuidv4(),
        username,
        email,
        password: hashedPassword,
        name,
        role: role as any,
        organization,
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      fileStorage.saveUsers(users);
      
      const token = jwt.sign(
        { id: newUser.id, username: newUser.username, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          organization: newUser.organization,
        },
      });
    } catch (error) {
      res.status(500).json({ error: '注册失败' });
    }
  },

  getMe: async (req: AuthRequest, res: Response) => {
    try {
      const users = fileStorage.getUsers();
      const user = users.find(u => u.id === req.user!.id);
      
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
      });
    } catch (error) {
      res.status(500).json({ error: '获取用户信息失败' });
    }
  },
};

