import { Router } from 'express';
import { getDeploymentLogs, getAiGenerations } from '../controllers/logsController';

const router = Router();

router.get('/deployments', getDeploymentLogs);
router.get('/ai-generations', getAiGenerations);

export default router;