import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getUser } from '../controllers/userController';

const router = Router();

router.get('/',authMiddleware, getUser); // Get profile by userId

export default router;
