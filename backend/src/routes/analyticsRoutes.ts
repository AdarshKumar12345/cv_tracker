import { Router } from 'express';
import {
  getDashboardStats,
  getApplicationsOverTime,
  getStatusDistribution,
} from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/applications', getApplicationsOverTime);
router.get('/status-distribution', getStatusDistribution);

export default router;
