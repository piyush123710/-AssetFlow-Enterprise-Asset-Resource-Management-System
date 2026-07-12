import { Router } from 'express';
import { reportIssue, getMaintenanceQueue, resolveIssue } from './maintenance.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Anyone can report an issue
router.post('/', reportIssue);

// Only admins/managers can view queue and resolve issues
router.get('/', authorizeRole(['ADMIN', 'ASSET_MANAGER']), getMaintenanceQueue);
router.put('/:id/resolve', authorizeRole(['ADMIN', 'ASSET_MANAGER']), resolveIssue);

export default router;
