import { Router } from 'express';
import {
  applyForJob,
  updateApplicationStatus,
  getApplicationsForJob,
  getApplicationsForJobSeeker,
} from '../controllers/applicationController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Job Seeker applies for a job
router.post('/apply/:id', verifyToken, applyForJob);

// Employer updates application status (Accepted/Rejected)
router.put('/status/:id', verifyToken, updateApplicationStatus);

// Employer fetches applications for a job
router.get('/job/:id', verifyToken, getApplicationsForJob);

// Job Seeker fetches all applications they've made
router.get('/seeker', verifyToken, getApplicationsForJobSeeker);

export default router;
