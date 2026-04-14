    import axios from "axios";

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    });

    /** 
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


  export const generateResumePdf = async (interviewReportId) => {
    try {
        const response = await api.get(`/api/interview/resume/pdf/${interviewReportId}`, {
            responseType: "blob",
        });
        return response.data;
    } catch (error) {
        const responseData = error.response?.data;

        // When responseType is "blob", error payloads come back as Blobs too.
        // Parse it back to JSON to get the real error message.
        if (responseData instanceof Blob && responseData.type === "application/json") {
            const text = await responseData.text();
            throw JSON.parse(text);
        }

        throw responseData || error;
    }
};
