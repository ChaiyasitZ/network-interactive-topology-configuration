import { Router } from 'express';
import { deployConfigurations } from '../controllers/deployController';

const router = Router();

router.post('/', deployConfigurations);

export default router;