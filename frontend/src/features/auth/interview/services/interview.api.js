import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

/**
 * 
 *  
 * @description service to generate interview report based on user self description and job description or resume
 */
export const generateInterviewReport = async({jobTitle, jobDescription, resumeFile, selfDescription}) => {
    const formData = new FormData();
 
    formData.append("jobTitle", jobTitle);
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resumeFile);

    try {
        const response = await api.post("/api/interview/", formData, {
            headers: {  
                "Content-Type": "multipart/form-data"
            } 
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }       
}


/**
 * 
 *  
 * @description service to get interview report by interview id
 */
export const getInterviewReportById = async(interviewId) => {
    try {
        const response = await api.get(`/api/interview/report/${interviewId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}


/**
 * 
 *  
 * @description service to all interview reports of the user logged in
 */
export const getAllInterviewReports = async() => {
    try {
        const response = await api.get("/api/interview/");
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}   