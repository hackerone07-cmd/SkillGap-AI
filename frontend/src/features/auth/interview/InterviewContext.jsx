
import { createContext, useState } from "react";




export const InterviewContext = createContext();


export const InterviewProvider = ({children})=>{
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [reports, setReports]  = useState([])
 

    return (
         <InterviewContext.Provider value={{ report, setReport, loading, setLoading , reports, setReports}}>
              {children}
            </InterviewContext.Provider>
    )
}