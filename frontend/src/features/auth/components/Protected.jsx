import React from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { Navigate } from 'react-router'
import PageLoader from '../../../components/PageLoader.jsx'


const Protected = ({children}) => {

    const {isInitializing, user} = useAuth();

    if(isInitializing) {
      return (
        <PageLoader
          eyebrow="Restoring session"
          title="Preparing your workspace"
          description="We’re confirming your account and loading the interview dashboard."
        />
      )
    }
 if(!user) 
    return <Navigate  to={"/login"}/>
 
 
    return children;
}

export default Protected
