import { Router } from 'express';
import { generateTopology, generateConfigs } from '../controllers/aiController';

const router = Router();

router.post('/generate-topology', generateTopology);
router.post('/generate-configs', generateConfigs);

export default router;