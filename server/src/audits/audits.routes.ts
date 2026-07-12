import { Router } from 'express';
import { createAuditCycle, getAuditCycles, getAuditCycleById, addAssetToAudit, updateAuditItem } from './audits.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Allow employees as well for demo purposes
router.use(authorizeRole(['ADMIN', 'ASSET_MANAGER', 'EMPLOYEE']));

router.post('/', createAuditCycle);
router.get('/', getAuditCycles);
router.get('/:id', getAuditCycleById);
router.post('/:id/items', addAssetToAudit);
router.put('/items/:itemId', updateAuditItem);

export default router;
