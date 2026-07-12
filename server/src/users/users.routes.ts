import { Router } from 'express';
import { getUsers, updateUserRole } from './users.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getUsers);

// Only Admins can change user roles and department assignment globally
router.put('/:id/role', authorizeRole(['ADMIN']), updateUserRole);

export default router;
