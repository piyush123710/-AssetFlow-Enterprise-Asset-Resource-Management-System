import { Router } from 'express';
import { getDepartments, createDepartment, updateDepartment } from './departments.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// All users can view departments
router.get('/', getDepartments);

// Only Admins can manage departments
router.post('/', authorizeRole(['ADMIN']), createDepartment);
router.put('/:id', authorizeRole(['ADMIN']), updateDepartment);

export default router;
