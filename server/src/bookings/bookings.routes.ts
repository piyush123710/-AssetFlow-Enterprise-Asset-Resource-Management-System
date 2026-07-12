import { Router } from 'express';
import { createBooking, getMyBookings, getAllBookings, respondToBooking, getSharedAssets } from './bookings.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/shared-assets', getSharedAssets);
router.post('/', createBooking);
router.get('/my', getMyBookings);

// Admin/Managers
router.get('/all', authorizeRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']), getAllBookings);
router.put('/:id', authorizeRole(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']), respondToBooking);

export default router;
