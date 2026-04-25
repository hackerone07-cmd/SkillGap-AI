import { Router } from "express"
import { authUser } from "../middlewares/auth.middlewares.js";
import { generateInterviewReportController } from "../controllers/interview.controller.js";
import { getInterviewReportByIdController } from "../controllers/interview.controller.js";
import { getAllInterviewReportController } from "../controllers/interview.controller.js";
import { generateResumePdfController } from "../controllers/interview.controller.js";
import { deleteInterviewReportController } from "../controllers/interview.controller.js";
import upload from "../middlewares/file.middleware.js";

const interviewRouter = Router();


/**
 * @route POST /api/interview
 * @description generate new interview report basis on the user 
 * self description, resume pdf, and the job description
 * @access Private
 */
interviewRouter.post("/",authUser, upload.single("resume"), generateInterviewReportController)


/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by id
 * @access Private
 */
interviewRouter.get("/report/:interviewId",authUser, getInterviewReportByIdController)

/**
 * @route DELETE /api/interview/report/:interviewId
 * @description delete interview report by id
 * @access Private
 */
interviewRouter.delete("/report/:interviewId", authUser, deleteInterviewReportController)



/**
 * @route GET /api/interview
 * @description get all interview reports by logged in user
 * @access Private
 */
interviewRouter.get("/",authUser, getAllInterviewReportController)


/**
 * @route GET /api/interview/resume/pdf/:interviewReportId
 * @description generate resume pdf on the basis of the user self description, and the job description
 * @access Private
 */
interviewRouter.get("/resume/pdf/:interviewReportId",authUser, generateResumePdfController) 

export default interviewRouter
