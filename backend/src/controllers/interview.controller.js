import { asyncHandler } from "../utils/AsyncHandler.js";
import {PDFParse} from "pdf-parse";
import generateAiInterviewReport from "../services/ai.service.js";
import {interviewReportModel} from "../models/interviewReport.model.js"


export const generateInterviewReportController =asyncHandler(async (req, res) =>{
     if (!req.file) {
        return res.status(400).json({
            message: "Resume PDF is required"
        });
     }

     const resumeContent = await (new PDFParse(Uint8Array.from(req.file.buffer))).getText();
     

     const {selfDescription,jobDescription} = req.body

     const interviewReportByAi = await generateAiInterviewReport({
        resume : resumeContent.text,
        selfDescription,
        jobDescription
     });
   console.log("AI RAW RESPONSE:", interviewReportByAi);
     const interviewReport = await interviewReportModel.create({
          user: req.user?._id,
            jobDescription,
        resume: resumeContent.text,
        selfDescription,
        ...interviewReportByAi,
      
     });

     res.status(201).json({
        message :" interview report generated successfully",
        interviewReport
     });

})
