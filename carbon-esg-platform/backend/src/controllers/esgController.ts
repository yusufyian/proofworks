import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { storage } from '../storage/fileStorage';

export async function getESGReports(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未授权' });
    }

    const companyId = req.user.companyId;
    const { year, status } = req.query;

    const reports = await storage.findESGReports({
      companyId,
      year: year ? Number(year) : undefined,
      status: status as string,
    });

    res.json({ data: reports });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getESGReport(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const report = await storage.findESGReport(id);

    if (!report) {
      return res.status(404).json({ error: 'ESG报告不存在' });
    }

    if (req.user && report.companyId !== req.user.companyId) {
      return res.status(403).json({ error: '无权访问' });
    }

    res.json({ data: report });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createESGReport(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未授权' });
    }

    const report = await storage.createESGReport({
      companyId: req.user.companyId!,
      ...req.body,
    });

    res.status(201).json({ data: report });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateESGReport(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const report = await storage.findESGReport(id);

    if (!report) {
      return res.status(404).json({ error: 'ESG报告不存在' });
    }

    if (req.user && report.companyId !== req.user.companyId) {
      return res.status(403).json({ error: '无权访问' });
    }

    const updated = await storage.updateESGReport(id, req.body);
    res.json({ data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

