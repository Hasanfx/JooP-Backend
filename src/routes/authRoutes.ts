import  express  from "express";
import { login,signup,logout } from "../controllers/authController";
import { verifyToken } from "../middleware/authMiddleware";
const router = express.Router();


router.post('/login',login)
router.post('/signup',signup)
router.post('/logout',verifyToken,logout)

export default router;

