import  express  from "express";
import { login,signup,logout } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { userSchema,userLoginSchema } from "../validations/userValidation";
const router = express.Router();

router.post('/login', validationMiddleware(userLoginSchema), login)
router.post('/signup',validationMiddleware(userSchema),signup)
router.post('/logout',authMiddleware,logout)

export default router;

