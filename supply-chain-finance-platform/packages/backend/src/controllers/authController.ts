import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const { username, email, password, role, companyName, companyCode } = req.body;

    if (!username || !email || !password || !role) {
      throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if user exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (existingUser.rows.length > 0) {
        throw new AppError('Username or email already exists', 409, 'USER_EXISTS');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const result = await client.query(
        `INSERT INTO users (username, email, password_hash, role, company_name, company_code)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, username, email, role, company_name, company_code, created_at`,
        [username, email, passwordHash, role, companyName || null, companyCode || null]
      );

      await client.query('COMMIT');

      const user = result.rows[0];
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          companyName: user.company_name,
        },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Registration error:', error);
      throw new AppError('Registration failed', 500);
    } finally {
      client.release();
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError('Username and password are required', 400, 'VALIDATION_ERROR');
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, username, email, password_hash, role, company_name, company_code, status FROM users WHERE username = $1 OR email = $1',
        [username]
      );

      if (result.rows.length === 0) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      const user = result.rows[0];

      if (user.status !== 'active') {
        throw new AppError('Account is not active', 403, 'ACCOUNT_INACTIVE');
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new AppError('JWT secret not configured', 500);
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
          companyId: user.company_code,
        },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            companyName: user.company_name,
          },
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Login error:', error);
      throw new AppError('Login failed', 500);
    } finally {
      client.release();
    }
  },

  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, username, email, role, company_name, company_code FROM users WHERE id = $1',
        [req.user!.id]
      );

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      res.json({
        success: true,
        data: {
          id: result.rows[0].id,
          username: result.rows[0].username,
          email: result.rows[0].email,
          role: result.rows[0].role,
          companyName: result.rows[0].company_name,
          companyCode: result.rows[0].company_code,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Get current user error:', error);
      throw new AppError('Failed to get user info', 500);
    } finally {
      client.release();
    }
  },
};

