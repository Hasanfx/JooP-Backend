import { Router } from 'express';
import { getProfile, createProfile, updateProfile } from '../controllers/profileController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/:id',verifyToken, getProfile); // Get profile by userId
router.post('/',verifyToken,createProfile);     // Create profile (both employer and job seeker)
router.put('/:id', verifyToken,updateProfile); // Update profile by userId

export default router;
