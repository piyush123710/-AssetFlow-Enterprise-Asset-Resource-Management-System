import { Router } from 'express';
import { getCategories, createCategory } from './categories.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// All authenticated users can view categories
router.get('/', getCategories);

// Only Admins (and maybe Asset Managers) can create categories
router.post('/', authorizeRole(['ADMIN', 'ASSET_MANAGER']), createCategory);

export default router;
