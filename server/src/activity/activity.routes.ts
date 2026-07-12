import { Router } from 'express';
import { getActivityLogs } from './activity.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Only Admins should be able to view full system activity logs
router.get('/', authorizeRole(['ADMIN']), getActivityLogs);

export default router;
