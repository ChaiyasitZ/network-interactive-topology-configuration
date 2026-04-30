import { Request, Response } from 'express';
import { DeploymentLog } from '../models/DeploymentLog';
import { AIGeneration } from '../models/AIGeneration';

export const getDeploymentLogs = async (req: Request, res: Response) => {
  try {
    const logs = await DeploymentLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching deployment logs:', error);
    res.status(500).json({ error: 'Failed to fetch deployment logs' });
  }
};

export const getAiGenerations = async (req: Request, res: Response) => {
  try {
    const logs = await AIGeneration.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching AI generation logs:', error);
    res.status(500).json({ error: 'Failed to fetch AI generation logs' });
  }
};