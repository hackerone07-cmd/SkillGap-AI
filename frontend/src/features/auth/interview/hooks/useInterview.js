import { useContext } from "react";
import { getAllInterviewReports,generateInterviewReport, getInterviewReportById,generateResumePdf } from "../services/interview.api";
import { InterviewContext } from "../interview.context";


export const useInterview = () =>{
    const context = useContext(InterviewContext);

    if(!context) {
       throw new Error("useInterview must be in the ")
    }
     const {
        loading,
        report,
        setReport,
        reports,
        setReports,
        isReportsLoading,
        setIsReportsLoading,
        isReportLoading,
        setIsReportLoading,
        isGenerating,
        setIsGenerating,
        isDownloadingResume,
        setIsDownloadingResume,
     }  = context


     const generateReport = async({jobTitle, jobDescription, selfDescription, resumeFile }) => {
        setIsGenerating(true)

        try {
            const response = await generateInterviewReport({jobTitle, jobDescription, selfDescription, resumeFile})
            setReport(response.data)
            return response.data;
        }catch(error){
            console.error("Generate report error:", error);
            throw error;
        }finally{
            setIsGenerating(false);
        }
     }

     const getReportById = async(interviewId)=>{
        setIsReportLoading(true)

        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.data)
            return response.data;
        } catch (error) {
            console.error("Get report error:", error);
            throw error;
        }finally{
            setIsReportLoading(false)
        }
     }

     const getAllReports = async() =>{
        setIsReportsLoading(true)
        try{
            const response = await getAllInterviewReports()
            const reportsData = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
            setReports(reportsData)
            return reportsData;
        }catch(error){
           console.error("Get all reports error:", error);
           setReports([]);
           return [];
        }finally{
            setIsReportsLoading(false)
        }
     }


   const getResumePdf = async (interviewReportId) => {
    setIsDownloadingResume(true);
    try {
        const response = await generateResumePdf(interviewReportId);
        const url = window.URL.createObjectURL(new Blob([response], { type: "application/pdf" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `resume_${interviewReportId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

    } catch (error) {
        console.error("Generate resume PDF error:", error);

        // Relay the retry hint to the UI
        if (error?.statusCode === 429) {
            throw {
                ...error,
                userMessage: `AI service is busy. Please try again in ${error.retryDelay || "a minute"}.`,
            };
        }
        throw error;
    } finally {
        setIsDownloadingResume(false);
    }
};
     return {
        loading,
        report,
        reports,
        isReportsLoading,
        isReportLoading,
        isGenerating,
        isDownloadingResume,
        getAllReports,
        generateReport,
        getReportById,
        getResumePdf,
     }
}
