import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import fileStorage from '../storage/fileStorage';
import logger from '../utils/logger';
import { HealthAssessment } from '../types';

export const getHealthAssessments = async (req: AuthRequest, res: Response) => {
  try {
    const { equipmentId, page = 1, limit = 20 } = req.query;
    let assessments = fileStorage.getHealthAssessments();

    if (equipmentId) {
      assessments = assessments.filter(a => a.equipmentId === equipmentId);
    }

    // 按日期倒序
    assessments.sort((a, b) => 
      new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
    );

    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = assessments.slice(start, end);

    res.json({
      assessments: paginated,
      total: assessments.length,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error: any) {
    logger.error('Get health assessments error:', error);
    res.status(500).json({ error: '获取健康度评估失败' });
  }
};

export const createHealthAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const equipment = fileStorage.getEquipment();
    const eq = equipment.find(e => e.id === req.body.equipmentId);

    if (!eq) {
      return res.status(404).json({ error: '设备不存在' });
    }

    const indicators = req.body.indicators;
    const healthScore = Math.round(
      (indicators.vibration?.score || 0) * 0.3 +
      (indicators.temperature?.score || 0) * 0.25 +
      (indicators.current?.score || 0) * 0.2 +
      (indicators.noise?.score || 0) * 0.15 +
      (indicators.performance?.score || 0) * 0.1
    );

    const level = healthScore >= 90 ? 'excellent' 
      : healthScore >= 70 ? 'good'
      : healthScore >= 50 ? 'fair'
      : 'poor';

    const assessment: HealthAssessment = {
      id: crypto.randomUUID(),
      equipmentId: req.body.equipmentId,
      equipmentNo: eq.equipmentNo,
      assessmentDate: req.body.assessmentDate || new Date().toISOString(),
      healthScore,
      indicators,
      level,
      recommendation: healthScore < 60 ? '建议立即检修，更换相关部件' : undefined,
      createdAt: new Date().toISOString(),
    };

    const assessments = fileStorage.getHealthAssessments();
    assessments.push(assessment);
    fileStorage.saveHealthAssessments(assessments);

    // 更新设备健康度
    eq.healthScore = healthScore;
    fileStorage.saveEquipment(equipment);

    res.status(201).json(assessment);
  } catch (error: any) {
    logger.error('Create health assessment error:', error);
    res.status(500).json({ error: '创建健康度评估失败' });
  }
};