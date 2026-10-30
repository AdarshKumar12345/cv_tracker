import { Router } from 'express';
import {
  getCompanies,
  createCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from '../controllers/companyController';
import { authenticate } from '../middleware/auth';
import { validateRequest, companyCreateSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', getCompanies);
router.post('/', validateRequest(companyCreateSchema), createCompany);
router.get('/:id', getCompanyById);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

export default router;
