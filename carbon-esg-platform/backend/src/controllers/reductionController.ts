import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { storage } from '../storage/fileStorage';

export async function getReductionProjects(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未授权' });
    }

    const companyId = req.user.companyId;
    const { status, vintage } = req.query;

    const projects = await storage.findReductionProjects({
      companyId,
      status: status as string,
      vintage: vintage as string,
    });

    res.json({ data: projects });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getReductionProject(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const project = await storage.findReductionProject(id);

    if (!project) {
      return res.status(404).json({ error: '减排项目不存在' });
    }

    if (req.user && project.companyId !== req.user.companyId) {
      return res.status(403).json({ error: '无权访问' });
    }

    res.json({ data: project });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createReductionProject(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未授权' });
    }

    const {
      projectName,
      projectType,
      baselineEmissions,
      actualEmissions,
      vintage,
      methodology,
      status,
    } = req.body;

    const reductionAmount = (baselineEmissions || 0) - (actualEmissions || 0);

    const project = await storage.createReductionProject({
      companyId: req.user.companyId!,
      projectName,
      projectType,
      baselineEmissions: baselineEmissions || 0,
      actualEmissions: actualEmissions || 0,
      reductionAmount,
      vintage,
      methodology,
      status: status || 'planning',
    });

    res.status(201).json({ data: project });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateReductionProject(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const project = await storage.findReductionProject(id);

    if (!project) {
      return res.status(404).json({ error: '减排项目不存在' });
    }

    if (req.user && project.companyId !== req.user.companyId) {
      return res.status(403).json({ error: '无权访问' });
    }

    const updates = req.body;
    if (updates.baselineEmissions !== undefined || updates.actualEmissions !== undefined) {
      const baseline = updates.baselineEmissions ?? project.baselineEmissions;
      const actual = updates.actualEmissions ?? project.actualEmissions;
      updates.reductionAmount = baseline - actual;
    }

    const updated = await storage.updateReductionProject(id, updates);
    res.json({ data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

