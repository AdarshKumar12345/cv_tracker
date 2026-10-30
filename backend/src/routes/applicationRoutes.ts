import { Router } from 'express';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/applicationController';
import { authenticate } from '../middleware/auth';
import {
  validateRequest,
  applicationCreateSchema,
  applicationStatusUpdateSchema,
} from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', getApplications);
router.post('/', validateRequest(applicationCreateSchema), createApplication);
router.get('/:id', getApplicationById);
router.put('/:id', updateApplication);
router.patch('/:id/status', validateRequest(applicationStatusUpdateSchema), updateApplicationStatus);
router.delete('/:id', deleteApplication);

export default router;
