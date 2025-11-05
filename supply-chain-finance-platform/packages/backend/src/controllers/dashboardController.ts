import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const dashboardController = {
  async getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const role = req.user!.role;
    const client = await pool.connect();
    try {
      let certQuery = '';
      let appQuery = '';

      if (role === 'core_enterprise') {
        certQuery = 'WHERE creditor_id = $1';
        appQuery = `WHERE EXISTS (
          SELECT 1 FROM certificates c WHERE c.id = f.certificate_id AND c.creditor_id = $1
        )`;
      } else if (role === 'supplier') {
        certQuery = 'WHERE debtor_id = $1';
        appQuery = 'WHERE applicant_id = $1';
      } else if (role === 'bank') {
        certQuery = '';
        appQuery = 'WHERE financier_id = $1 OR financier_id IS NULL';
      }

      const certStats = await client.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'holding') as holding,
          COUNT(*) FILTER (WHERE status = 'pledged') as pledged,
          COUNT(*) FILTER (WHERE status = 'transferred') as transferred,
          SUM(remaining_amount) FILTER (WHERE status = 'holding') as total_amount
         FROM certificates ${certQuery}`,
        role !== 'admin' ? [userId] : []
      );

      const appStats = await client.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'approved') as approved,
          COUNT(*) FILTER (WHERE status = 'disbursed') as disbursed,
          SUM(financing_amount) FILTER (WHERE status = 'disbursed') as total_financing
         FROM financing_applications ${appQuery}`,
        role !== 'admin' ? [userId] : []
      );

      res.json({
        success: true,
        data: {
          certificates: certStats.rows[0],
          financing: appStats.rows[0],
        },
      });
    } catch (error) {
      throw new Error('Failed to fetch dashboard stats');
    } finally {
      client.release();
    }
  },

  async getCertificatesOverview(req: AuthRequest, res: Response): Promise<void> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT status, COUNT(*) as count, SUM(remaining_amount) as total_amount
         FROM certificates
         GROUP BY status`
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      throw new Error('Failed to fetch certificates overview');
    } finally {
      client.release();
    }
  },

  async getFinancingOverview(req: AuthRequest, res: Response): Promise<void> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT status, COUNT(*) as count, SUM(financing_amount) as total_amount
         FROM financing_applications
         GROUP BY status`
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      throw new Error('Failed to fetch financing overview');
    } finally {
      client.release();
    }
  },
};

