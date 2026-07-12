import { Router } from 'express';
import { registerAsset, getAssets, getAssetById } from './assets.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Get assets with pagination and filters
router.get('/', getAssets);

// Get single asset by ID
router.get('/:id', getAssetById);

// Only Asset Managers and Admins can register assets
router.post('/register', authorizeRole(['ADMIN', 'ASSET_MANAGER']), registerAsset);

export default router;
