import { Router } from "express"
import { authUser } from "../middlewares/auth.middlewares.js";
import { generateInterviewReportController } from "../controllers/interview.controller.js";
import upload from "../middlewares/file.middleware.js";

const interviewRouter = Router();


/**
 * @route POST /api/interview
 * @description generate new interview report basis on the user 
 * self description, resume pdf, and the job description
 * @access Private
 */
interviewRouter.post("/", upload.single("resume"), generateInterviewReportController)


export default interviewRouter
