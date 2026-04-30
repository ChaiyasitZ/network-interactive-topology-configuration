import { Router } from 'express';
import { discoverTopology } from '../controllers/discoveryController';

const router = Router();

router.post('/', discoverTopology);

export default router;