import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";

export const InterviewContext = createContext();


export const InterviewProvider = ({children})=>{
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [reports, setReports]  = useState([])

    useEffect(() => {
        setReport(null);
        setReports([]);
        setLoading(false);
    }, [user?.id]);
 

    return (
         <InterviewContext.Provider value={{ report, setReport, loading, setLoading , reports, setReports}}>
              {children}
            </InterviewContext.Provider>
    )
}
