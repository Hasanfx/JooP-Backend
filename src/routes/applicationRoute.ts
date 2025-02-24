import { Router } from 'express';
import {
  applyForJob,
  updateApplicationStatus,
  getApplicationsForJob,
  getApplicationsForJobSeeker,
} from '../controllers/applicationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Job Seeker applies for a job
router.post('/apply/:id', authMiddleware, applyForJob);

// Employer updates application status (Accepted/Rejected)
router.put('/status/:id', authMiddleware, updateApplicationStatus);

// Employer fetches applications for a job
router.get('/job/:id', authMiddleware, getApplicationsForJob);

// Job Seeker fetches all applications they've made
router.get('/myapplies', authMiddleware, getApplicationsForJobSeeker);

export default router;
