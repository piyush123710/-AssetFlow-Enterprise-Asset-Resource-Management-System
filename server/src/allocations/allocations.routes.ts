import { Router } from 'express';
import { allocateAsset, getMyAssets, returnAsset } from './allocations.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Employees can view their own assets and return them
router.get('/my', getMyAssets);
router.post('/:id/return', returnAsset);

// Only Asset Managers and Admins can allocate assets to others
router.post('/', authorizeRole(['ADMIN', 'ASSET_MANAGER']), allocateAsset);

export default router;
