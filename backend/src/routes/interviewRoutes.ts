import { Router } from 'express';
import {
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} from '../controllers/interviewController';
import { authenticate } from '../middleware/auth';
import { validateRequest, interviewCreateSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', getInterviews);
router.post('/', validateRequest(interviewCreateSchema), createInterview);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);

export default router;
