import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Home from "./features/auth/interview/pages/Home";
import Protected from "./features/auth/components/protected";
import Interview from "./features/auth/interview/pages/Interview";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <Protected>
        <Home />
      </Protected>
    ),
  },
  {
    path: "/interview/:interviewId",
    element: (
      <Protected>
        <Interview />
      </Protected>
    ),
  },
]);

export default router;
