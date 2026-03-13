import React from 'react'
import { RouterProvider } from 'react-router'
import router from './app.routes'
import { authProvider } from './features/auth/auth.context'

const App = () => {
  return (
<authProvider>

    <RouterProvider router={router}/>
</authProvider>
  )
}

export default App
