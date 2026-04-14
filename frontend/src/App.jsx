import React from 'react'
import { RouterProvider } from 'react-router'
import router from './app.routes'
import { AuthProvider } from './features/auth/AuthContext'
import { InterviewProvider } from './features/auth/interview/InterviewContext'

const App = () => {
  return (
<AuthProvider>

   <InterviewProvider>
     <RouterProvider router={router}/>
   </InterviewProvider>
</AuthProvider>
  )
}

export default App
