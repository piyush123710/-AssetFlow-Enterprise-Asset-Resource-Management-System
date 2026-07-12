import { Router } from 'express';
import { requestTransfer, getTransfers, respondToTransfer } from './transfers.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Employees can request transfers
router.post('/', requestTransfer);

// Managers/Admins can view and respond to transfers
router.get('/', authorizeRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']), getTransfers);
router.put('/:id', authorizeRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']), respondToTransfer);

export default router;
