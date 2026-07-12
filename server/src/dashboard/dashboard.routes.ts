import { Router } from 'express';
import { getStats, getCharts } from './dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protect all dashboard routes
router.use(authenticate);

router.get('/stats', getStats);
router.get('/charts', getCharts);

export default router;
