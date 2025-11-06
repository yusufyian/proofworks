import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { storage } from '../storage/fileStorage';

export async function getEmissionFactors(req: AuthRequest, res: Response) {
  try {
    const { category, search } = req.query;

    const factors = await storage.findEmissionFactors({
      category: category as string,
      search: search as string,
    });

    res.json({ data: factors });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createEmissionFactor(req: AuthRequest, res: Response) {
  try {
    const factor = await storage.createEmissionFactor(req.body);
    res.status(201).json({ data: factor });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

