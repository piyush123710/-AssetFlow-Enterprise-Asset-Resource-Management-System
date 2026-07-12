import { Router } from 'express';
import { registerAsset } from './assets.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Only Asset Managers and Admins can register assets
router.post('/register', authorizeRole(['ADMIN', 'ASSET_MANAGER']), registerAsset);

export default router;
