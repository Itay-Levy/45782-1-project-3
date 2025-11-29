import { Router } from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth';
import {
  getAllVacations,
  getVacationById,
  createVacation,
  updateVacation,
  deleteVacation,
  followVacation,
  unfollowVacation,
  getVacationsReport,
  downloadCsv
} from '../controllers/vacationsController';

const router = Router();

// Protected routes - require authentication
router.get('/', verifyToken, getAllVacations);
router.get('/report', verifyToken, verifyAdmin, getVacationsReport);
router.get('/csv', verifyToken, verifyAdmin, downloadCsv);
router.get('/:id', verifyToken, getVacationById);

// Admin only routes
router.post('/', verifyToken, verifyAdmin, createVacation);
router.put('/:id', verifyToken, verifyAdmin, updateVacation);
router.delete('/:id', verifyToken, verifyAdmin, deleteVacation);

// User follow/unfollow routes
router.post('/:id/follow', verifyToken, followVacation);
router.delete('/:id/follow', verifyToken, unfollowVacation);

export default router;
