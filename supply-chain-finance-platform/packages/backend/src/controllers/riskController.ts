import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const riskController = {
  async assessRisk(req: Request, res: Response): Promise<void> {
    const { certificateId } = req.body;

    if (!certificateId) {
      throw new AppError('Certificate ID is required', 400);
    }

    // Mock risk assessment logic
    const riskScore = Math.floor(Math.random() * 40) + 60; // 60-100
    let riskRating = 'BBB';
    let financingRatio = 0.5;

    if (riskScore >= 90) {
      riskRating = 'AAA';
      financingRatio = 0.8;
    } else if (riskScore >= 80) {
      riskRating = 'AA';
      financingRatio = 0.7;
    } else if (riskScore >= 70) {
      riskRating = 'A';
      financingRatio = 0.6;
    }

    res.json({
      success: true,
      data: {
        certificateId,
        riskScore,
        riskRating,
        suggestedFinancingRatio: financingRatio,
        assessmentDate: new Date().toISOString(),
      },
    });
  },

  async getRiskScore(req: Request, res: Response): Promise<void> {
    const { certificateId } = req.params;
    // Implementation similar to assessRisk
    res.json({
      success: true,
      data: {
        certificateId,
        riskScore: 85,
        riskRating: 'AA',
      },
    });
  },

  async checkDuplicateFinancing(req: Request, res: Response): Promise<void> {
    const { certificateId } = req.body;
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT COUNT(*) as count FROM financing_applications 
         WHERE certificate_id = $1 AND status IN ('pending', 'approved', 'disbursed')`,
        [certificateId]
      );

      const isDuplicate = parseInt(result.rows[0].count) > 0;

      res.json({
        success: true,
        data: {
          certificateId,
          isDuplicate,
          existingApplications: parseInt(result.rows[0].count),
        },
      });
    } catch (error) {
      throw new AppError('Failed to check duplicate financing', 500);
    } finally {
      client.release();
    }
  },

  async checkCircularPledge(req: Request, res: Response): Promise<void> {
    // Mock implementation - would need graph algorithm
    res.json({
      success: true,
      data: {
        hasCircularPledge: false,
        detectedCycles: [],
      },
    });
  },
};

