import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const auditController = {
  async getAuditLogs(req: Request, res: Response): Promise<void> {
    const { page = 1, limit = 50, action, resourceType } = req.query;
    const client = await pool.connect();
    try {
      let query = 'SELECT * FROM audit_logs WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;

      if (action) {
        query += ` AND action = $${paramCount}`;
        params.push(action);
        paramCount++;
      }

      if (resourceType) {
        query += ` AND resource_type = $${paramCount}`;
        params.push(resourceType);
        paramCount++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limit, (page - 1) * limit);

      const result = await client.query(query, params);

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      throw new AppError('Failed to fetch audit logs', 500);
    } finally {
      client.release();
    }
  },

  async getCertificateAuditTrail(req: Request, res: Response): Promise<void> {
    const { certificateId } = req.params;
    const client = await pool.connect();
    try {
      // Get certificate info
      const certResult = await client.query(
        'SELECT * FROM certificates WHERE id = $1',
        [certificateId]
      );

      // Get transfer history
      const transferResult = await client.query(
        `SELECT t.*, 
                u1.company_name as from_company,
                u2.company_name as to_company
         FROM certificate_transfers t
         LEFT JOIN users u1 ON t.from_user_id = u1.id
         LEFT JOIN users u2 ON t.to_user_id = u2.id
         WHERE t.certificate_id = $1
         ORDER BY t.created_at ASC`,
        [certificateId]
      );

      // Get financing history
      const financingResult = await client.query(
        `SELECT f.*, u.company_name as applicant_name
         FROM financing_applications f
         LEFT JOIN users u ON f.applicant_id = u.id
         WHERE f.certificate_id = $1
         ORDER BY f.created_at ASC`,
        [certificateId]
      );

      res.json({
        success: true,
        data: {
          certificate: certResult.rows[0] || null,
          transfers: transferResult.rows,
          financing: financingResult.rows,
        },
      });
    } catch (error) {
      throw new AppError('Failed to fetch audit trail', 500);
    } finally {
      client.release();
    }
  },

  async getPenetrationTrace(req: Request, res: Response): Promise<void> {
    const { certificateId } = req.params;
    const client = await pool.connect();
    try {
      // Get full transfer chain back to core enterprise
      const result = await client.query(
        `WITH RECURSIVE transfer_chain AS (
          SELECT c.id, c.certificate_id, c.creditor_id, c.debtor_id, 
                 c.creditor_id as original_creditor_id, 0 as level
          FROM certificates c
          WHERE c.id = $1
          
          UNION ALL
          
          SELECT c.id, c.certificate_id, c.creditor_id, c.debtor_id,
                 tc.original_creditor_id, tc.level + 1
          FROM certificates c
          JOIN certificate_transfers t ON c.id = t.certificate_id
          JOIN transfer_chain tc ON t.from_user_id = tc.debtor_id
          WHERE tc.level < 10
        )
        SELECT DISTINCT * FROM transfer_chain
        ORDER BY level`,
        [certificateId]
      );

      res.json({
        success: true,
        data: {
          certificateId,
          trace: result.rows,
          depth: result.rows.length,
        },
      });
    } catch (error) {
      throw new AppError('Failed to fetch penetration trace', 500);
    } finally {
      client.release();
    }
  },
};

