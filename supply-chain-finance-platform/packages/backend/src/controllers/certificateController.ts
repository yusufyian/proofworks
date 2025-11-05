import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const certificateController = {
  async getCertificates(req: AuthRequest, res: Response): Promise<void> {
    const { status, page = 1, limit = 20 } = req.query;
    const userId = req.user!.id;
    const role = req.user!.role;

    const client = await pool.connect();
    try {
      let query = `
        SELECT c.*, 
               u1.company_name as creditor_name,
               u2.company_name as debtor_name
        FROM certificates c
        LEFT JOIN users u1 ON c.creditor_id = u1.id
        LEFT JOIN users u2 ON c.debtor_id = u2.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramCount = 1;

      // Filter by role
      if (role === 'core_enterprise') {
        query += ` AND c.creditor_id = $${paramCount}`;
        params.push(userId);
        paramCount++;
      } else if (role === 'supplier') {
        query += ` AND c.debtor_id = $${paramCount}`;
        params.push(userId);
        paramCount++;
      }

      if (status) {
        query += ` AND c.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      query += ` ORDER BY c.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limit, (page - 1) * limit);

      const result = await client.query(query, params);
      const countResult = await client.query('SELECT COUNT(*) FROM certificates');

      res.json({
        success: true,
        data: {
          certificates: result.rows,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: parseInt(countResult.rows[0].count),
          },
        },
      });
    } catch (error) {
      throw new AppError('Failed to fetch certificates', 500);
    } finally {
      client.release();
    }
  },

  async getCertificateById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT c.*, 
                u1.company_name as creditor_name,
                u2.company_name as debtor_name
         FROM certificates c
         LEFT JOIN users u1 ON c.creditor_id = u1.id
         LEFT JOIN users u2 ON c.debtor_id = u2.id
         WHERE c.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Certificate not found', 404, 'NOT_FOUND');
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch certificate', 500);
    } finally {
      client.release();
    }
  },

  async issueCertificate(req: AuthRequest, res: Response): Promise<void> {
    const {
      debtorId,
      initialAmount,
      expiryDate,
      contractHash,
      invoiceHash,
      metadata,
    } = req.body;

    if (!debtorId || !initialAmount || !expiryDate) {
      throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const certificateId = `CERT-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

      const result = await client.query(
        `INSERT INTO certificates (
          certificate_id, creditor_id, debtor_id, initial_amount, 
          remaining_amount, issue_date, expiry_date, contract_hash, 
          invoice_hash, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          certificateId,
          req.user!.id,
          debtorId,
          initialAmount,
          initialAmount,
          new Date(),
          new Date(expiryDate),
          contractHash || null,
          invoiceHash || null,
          metadata ? JSON.stringify(metadata) : null,
        ]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Certificate issued successfully',
        data: result.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to issue certificate', 500);
    } finally {
      client.release();
    }
  },
};

