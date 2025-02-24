import { Router } from 'express';
import {
    createJob,
    getAllJobs,
    deleteJob,
    updateJob,
    getJobsByEmployer,
    getJobById
} from '../controllers/jobController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/create', verifyToken,createJob);
router.delete('/:id', verifyToken,deleteJob);
router.put('/:id', verifyToken,updateJob);

router.get('/employer',verifyToken,getJobsByEmployer)
router.get('/:id',getJobById)
router.get('/',getAllJobs);

export default router;
