import { useContext, useState } from "react";
import { AuthContext } from "../auth.context";
import { InterviewContext } from "./interview.context";

const InterviewProviderState = ({ children }) => {
    const [isReportsLoading, setIsReportsLoading] = useState(false);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDownloadingResume, setIsDownloadingResume] = useState(false);
    const [report, setReport] = useState(null);
    const [reports, setReports]  = useState([]);

    return (
         <InterviewContext.Provider
           value={{
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
            loading: isReportsLoading || isReportLoading || isGenerating || isDownloadingResume,
           }}
         >
              {children}
            </InterviewContext.Provider>
    )
};

export const InterviewProvider = ({children})=>{
    const { user } = useContext(AuthContext);
    const userKey = user?._id ?? user?.id ?? "guest";

    return <InterviewProviderState key={userKey}>{children}</InterviewProviderState>;
}
