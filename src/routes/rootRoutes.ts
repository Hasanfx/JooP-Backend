import  express, { application }  from "express";
import authRoute from './authRoutes'
import jobRoute from './jobRoutes'
import applicationRoute from "./applicationRoute"
import profileRoute from "./profileRoute"
const router = express.Router();

router.use('/auth',authRoute)
router.use('/job',jobRoute)
router.use('/application',applicationRoute)
router.use('/profile',profileRoute)

export default router;

