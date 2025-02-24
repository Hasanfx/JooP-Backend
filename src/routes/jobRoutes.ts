import { Router } from 'express';
import {
    createJob,
    getAllJobs,
    deleteJob,
    updateJob,
    getJobsByEmployer,
    getJobById
} from '../controllers/jobController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { jobSchema } from '../validations/jobValidation';
const router = Router();

router.post('/create', authMiddleware,validationMiddleware(jobSchema),createJob);
router.delete('/:id', authMiddleware,deleteJob);
router.put('/:id', authMiddleware,validationMiddleware(jobSchema),updateJob);

router.get('/employer',authMiddleware,getJobsByEmployer)
router.get('/:id',getJobById)
router.get('/',getAllJobs);

export default router;
