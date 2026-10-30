import { Router } from 'express';
import {
  getResumes,
  uploadResumeFile,
  getResumeById,
  downloadResume,
  setDefaultResume,
  deleteResume,
} from '../controllers/resumeController';
import { authenticate } from '../middleware/auth';
import { uploadResume } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/', getResumes);
router.post('/upload', uploadResume.single('file'), uploadResumeFile);
router.get('/:id', getResumeById);
router.get('/:id/download', downloadResume);
router.patch('/:id/default', setDefaultResume);
router.delete('/:id', deleteResume);

export default router;
