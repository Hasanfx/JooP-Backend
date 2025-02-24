import { Router } from 'express';
import { getProfile, createProfile, updateProfile } from '../controllers/profileController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateProfileMiddleware } from '../middleware/profileValidateMiddleware';

const router = Router();

router.get('/',authMiddleware, getProfile); // Get profile by userId
router.post('/',authMiddleware,validateProfileMiddleware,createProfile);     // Create profile (both employer and job seeker)
router.put('/', authMiddleware,validateProfileMiddleware,updateProfile); // Update profile by userId

export default router;
