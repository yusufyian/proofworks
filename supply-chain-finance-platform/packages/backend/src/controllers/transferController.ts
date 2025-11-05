import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const transferController = {
  async createTransfer(req: AuthRequest, res: Response): Promise<void> {
    const { certificateId, toUserId, transferAmount, transferType } = req.body;

    if (!certificateId || !toUserId || !transferAmount) {
      throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check certificate
      const certResult = await client.query(
        'SELECT * FROM certificates WHERE id = $1',
        [certificateId]
      );

      if (certResult.rows.length === 0) {
        throw new AppError('Certificate not found', 404);
      }

      const certificate = certResult.rows[0];

      if (certificate.debtor_id !== req.user!.id) {
        throw new AppError('You are not the owner of this certificate', 403);
      }

      if (certificate.status !== 'holding') {
        throw new AppError('Certificate cannot be transferred in current state', 400);
      }

      if (parseFloat(certificate.remaining_amount) < parseFloat(transferAmount)) {
        throw new AppError('Insufficient certificate balance', 400);
      }

      // Create transfer record
      const transferResult = await client.query(
        `INSERT INTO certificate_transfers (
          certificate_id, from_user_id, to_user_id, transfer_amount, transfer_type
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [certificateId, req.user!.id, toUserId, transferAmount, transferType || 'full']
      );

      // Update certificate
      if (transferType === 'split') {
        // Split: create new certificate
        const newCertId = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        await client.query(
          `INSERT INTO certificates (
            certificate_id, original_certificate_id, creditor_id, debtor_id,
            initial_amount, remaining_amount, issue_date, expiry_date,
            contract_hash, invoice_hash, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            newCertId,
            certificate.certificate_id,
            certificate.creditor_id,
            toUserId,
            transferAmount,
            transferAmount,
            certificate.issue_date,
            certificate.expiry_date,
            certificate.contract_hash,
            certificate.invoice_hash,
            'holding',
          ]
        );

        // Update original certificate
        await client.query(
          'UPDATE certificates SET remaining_amount = remaining_amount - $1 WHERE id = $2',
          [transferAmount, certificateId]
        );
      } else {
        // Full transfer
        await client.query(
          'UPDATE certificates SET debtor_id = $1, status = $2 WHERE id = $3',
          [toUserId, 'transferred', certificateId]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Transfer completed successfully',
        data: transferResult.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create transfer', 500);
    } finally {
      client.release();
    }
  },

  async getTransfers(req: AuthRequest, res: Response): Promise<void> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT t.*, 
                u1.company_name as from_company_name,
                u2.company_name as to_company_name,
                c.certificate_id
         FROM certificate_transfers t
         LEFT JOIN users u1 ON t.from_user_id = u1.id
         LEFT JOIN users u2 ON t.to_user_id = u2.id
         LEFT JOIN certificates c ON t.certificate_id = c.id
         WHERE t.from_user_id = $1 OR t.to_user_id = $1
         ORDER BY t.created_at DESC`,
        [req.user!.id]
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      throw new AppError('Failed to fetch transfers', 500);
    } finally {
      client.release();
    }
  },

  async getTransferById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT t.*, 
                u1.company_name as from_company_name,
                u2.company_name as to_company_name
         FROM certificate_transfers t
         LEFT JOIN users u1 ON t.from_user_id = u1.id
         LEFT JOIN users u2 ON t.to_user_id = u2.id
         WHERE t.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Transfer not found', 404);
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch transfer', 500);
    } finally {
      client.release();
    }
  },

  async getTransferHistory(req: Request, res: Response): Promise<void> {
    const { certificateId } = req.params;
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT t.*, 
                u1.company_name as from_company_name,
                u2.company_name as to_company_name
         FROM certificate_transfers t
         LEFT JOIN users u1 ON t.from_user_id = u1.id
         LEFT JOIN users u2 ON t.to_user_id = u2.id
         WHERE t.certificate_id = $1
         ORDER BY t.created_at ASC`,
        [certificateId]
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      throw new AppError('Failed to fetch transfer history', 500);
    } finally {
      client.release();
    }
  },
};

