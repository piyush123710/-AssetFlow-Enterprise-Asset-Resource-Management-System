import { Router } from 'express';
import { getAssetsReport, getMaintenanceReport, getAuditsReport } from './reports.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorizeRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']));

router.get('/assets', getAssetsReport);
router.get('/maintenance', getMaintenanceReport);
router.get('/audits', getAuditsReport);

export default router;
