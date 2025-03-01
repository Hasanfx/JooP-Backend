import express, { application } from "express";
import authRoute from "./authRoutes";
import jobRoute from "./jobRoutes";
import applicationRoute from "./applicationRoute";
import profileRoute from "./profileRoute";
import userRoute from "./userRoute";
const router = express.Router();

router.use("/auth", authRoute);
router.use("/job", jobRoute);
router.use("/application", applicationRoute);
router.use("/profile", profileRoute);
router.use("/user", userRoute);

export default router;
