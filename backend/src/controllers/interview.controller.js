import { asyncHandler } from "../utils/AsyncHandler.js";
import {PDFParse} from "pdf-parse";
import {generateAiInterviewReport, generateResumePdf} from "../services/ai.service.js";
import {interviewReportModel} from "../models/interviewReport.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const generateInterviewReportController =asyncHandler(async (req, res) =>{
     if (!req.file) {
        throw new ApiError(400, "Resume PDF is required");
     }

     const resumeContent = await (new PDFParse(Uint8Array.from(req.file.buffer))).getText();
     

     const {selfDescription,jobDescription,jobTitle} = req.body

     if (!jobTitle || !jobDescription || !selfDescription) {
        throw new ApiError(400, "Job title, job description, and self description are required");
     }

     const interviewReportByAi = await generateAiInterviewReport({
        jobTitle,
        resume : resumeContent.text,
        selfDescription,
        jobDescription
     });
   console.log("AI RAW RESPONSE:", interviewReportByAi);
     const interviewReport = await interviewReportModel.create({
          user: req.user?._id,
          jobTitle,
            jobDescription,
        resume: resumeContent.text,
        selfDescription,
        ...interviewReportByAi,
      
     });

     res.status(201).json(
        new ApiResponse(201, interviewReport, "Interview report generated successfully")
     );

})

export const getInterviewReportByIdController = asyncHandler(async (req, res) =>{
    const {interviewId} = req.params

    const interviewReport = await interviewReportModel.findOne({
        _id: interviewId,
        user: req.user?._id
    });

    if(!interviewReport){
        throw new ApiError(404, "Interview report not found");
    }

    res.status(200).json(
        new ApiResponse(200, interviewReport, "Interview report fetched successfully")
    );
})

export const getAllInterviewReportController = asyncHandler(async (req, res) =>{

    const interviewReports = await interviewReportModel.find({
        user: req.user?._id
    }).sort({ createdAt: -1 }).select("-__v -user -resume -jobDescription -selfDescription -technicalQuestions -behavioralQuestions -skillGap -preparationPlan -skillGap -preparationPlan");

    if(!interviewReports || interviewReports.length === 0){
        throw new ApiError(404, "No interview reports found for this user");
    }

    res.status(200).json(
        new ApiResponse(200, interviewReports, "Interview reports fetched successfully")
    );
})

export const generateResumePdfController = asyncHandler(async(req,res) =>{
const {interviewReportId} = req.params

const interviewReport = await interviewReportModel.findById({
    _id: interviewReportId,
});

if(!interviewReport){
    throw new ApiError(404, "Interview report not found");
}

const {resume,jobDescription,selfDescription,jobTitle} = interviewReport

const pdfBuffer = await generateResumePdf({
    jobTitle,
    resume,
    selfDescription,
    jobDescription
});

res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", `attachment; filename=resume_${interviewReportId}.pdf`);
res.send(pdfBuffer);

})