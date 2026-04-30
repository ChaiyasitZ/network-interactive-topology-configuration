import { Router } from 'express';
import { deployConfigurations, rollbackConfiguration } from '../controllers/deployController';

const router = Router();

router.post('/', deployConfigurations);
router.post('/rollback', rollbackConfiguration);

export default router;