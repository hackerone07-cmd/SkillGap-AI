import { createContext ,useState} from "react";


export const authContext = createContext();

export const authProvider = ({Children}) =>{
    const[user,setUser] = useState(null)
    const[loading,setLoading] = useState(false)


    return (
        <authContext.Provider value={{user,setUser,loading,setLoading}}>
            {Children}
        </authContext.Provider>
    )
} 

