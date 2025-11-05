import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const financingController = {
  async applyForFinancing(req: AuthRequest, res: Response): Promise<void> {
    const { certificateId, financingAmount, financingTerm } = req.body;

    if (!certificateId || !financingAmount) {
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
        throw new AppError('Certificate cannot be used for financing', 400);
      }

      // Create financing application
      const result = await client.query(
        `INSERT INTO financing_applications (
          certificate_id, applicant_id, financing_amount, financing_term, status
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [certificateId, req.user!.id, financingAmount, financingTerm || 90, 'pending']
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Financing application submitted successfully',
        data: result.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to submit financing application', 500);
    } finally {
      client.release();
    }
  },

  async getApplications(req: AuthRequest, res: Response): Promise<void> {
    const { status } = req.query;
    const userId = req.user!.id;
    const role = req.user!.role;

    const client = await pool.connect();
    try {
      let query = `
        SELECT f.*, 
               c.certificate_id,
               u1.company_name as applicant_name,
               u2.company_name as financier_name
        FROM financing_applications f
        LEFT JOIN certificates c ON f.certificate_id = c.id
        LEFT JOIN users u1 ON f.applicant_id = u1.id
        LEFT JOIN users u2 ON f.financier_id = u2.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramCount = 1;

      if (role === 'supplier') {
        query += ` AND f.applicant_id = $${paramCount}`;
        params.push(userId);
        paramCount++;
      } else if (role === 'bank') {
        query += ` AND (f.financier_id = $${paramCount} OR f.financier_id IS NULL)`;
        params.push(userId);
        paramCount++;
      }

      if (status) {
        query += ` AND f.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      query += ` ORDER BY f.created_at DESC`;

      const result = await client.query(query, params);

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      throw new AppError('Failed to fetch applications', 500);
    } finally {
      client.release();
    }
  },

  async getApplicationById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT f.*, 
                c.certificate_id,
                u1.company_name as applicant_name,
                u2.company_name as financier_name
         FROM financing_applications f
         LEFT JOIN certificates c ON f.certificate_id = c.id
         LEFT JOIN users u1 ON f.applicant_id = u1.id
         LEFT JOIN users u2 ON f.financier_id = u2.id
         WHERE f.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Application not found', 404);
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch application', 500);
    } finally {
      client.release();
    }
  },

  async approveApplication(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { financingRate, riskScore, riskRating } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE financing_applications 
         SET status = 'approved', 
             financier_id = $1,
             financing_rate = $2,
             risk_score = $3,
             risk_rating = $4,
             approval_time = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [req.user!.id, financingRate, riskScore, riskRating, id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Application not found', 404);
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Application approved successfully',
        data: result.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to approve application', 500);
    } finally {
      client.release();
    }
  },

  async rejectApplication(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE financing_applications 
         SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Application not found', 404);
      }

      res.json({
        success: true,
        message: 'Application rejected',
        data: result.rows[0],
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to reject application', 500);
    } finally {
      client.release();
    }
  },

  async disburseFunds(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update application status
      const appResult = await client.query(
        `UPDATE financing_applications 
         SET status = 'disbursed', 
             disbursement_time = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND status = 'approved'
         RETURNING *`,
        [id]
      );

      if (appResult.rows.length === 0) {
        throw new AppError('Application not found or not approved', 404);
      }

      const application = appResult.rows[0];

      // Create pledge record
      await client.query(
        `INSERT INTO pledges (
          certificate_id, pledgor_id, pledgee_id, financing_application_id,
          pledge_amount, status, start_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          application.certificate_id,
          application.applicant_id,
          req.user!.id,
          application.id,
          application.financing_amount,
          'active',
          new Date(),
        ]
      );

      // Update certificate status
      await client.query(
        'UPDATE certificates SET status = $1 WHERE id = $2',
        ['pledged', application.certificate_id]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Funds disbursed successfully',
        data: appResult.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to disburse funds', 500);
    } finally {
      client.release();
    }
  },
};

