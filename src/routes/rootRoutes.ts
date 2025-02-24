import  express, { application }  from "express";
import authRoute from './authRoutes'
import jobRoute from './jobRoutes'
import applicationRoute from "./applicationRoute"
const router = express.Router();

router.use('/auth',authRoute)
router.use('/job',jobRoute)
router.use('/application',applicationRoute)

export default router;

