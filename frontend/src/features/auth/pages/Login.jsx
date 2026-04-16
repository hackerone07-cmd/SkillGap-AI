
import React, { useState } from "react";
import "../auth.form.scss"
import { useNavigate,Link, Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import PageLoader from "../../../components/PageLoader";


const Login = () => {


  const {user, isInitializing, isAuthenticating, handleLogin} = useAuth();
    
const navigate  = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    return newErrors;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setServerError("");

  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  setErrors({});

  const result = await handleLogin({
      email: email.trim(),
      password: password.trim()
    });

  if (result.success) {
    navigate("/workspace");
    return;
  }

  setServerError(result.message || "Login failed");
};

if(isInitializing){
  return (
    <PageLoader
      eyebrow="Session check"
      title="Opening sign in"
      description="We’re checking whether you already have an active session."
    />
  )
}

if (user) {
  return <Navigate to="/workspace" replace />;
}
    

  return (
    <div id="form-container">
      <form onSubmit={handleSubmit} id="form-box">
        <p id="form-kicker">Interview Prep Workspace</p>
        <h2 id="form-title">Welcome back</h2>
        <p id="form-subtitle">Sign in to continue building focused, role-specific interview plans.</p>

        {serverError && <p id="server-error">{serverError}</p>}

        <input
          id="email-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p id="email-error">{errors.email}</p>}

        <input
          id="password-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <p id="password-error">{errors.password}</p>}

        <button id="form-button" type="submit" disabled={isAuthenticating}>
          {isAuthenticating ? "Signing in..." : "Continue to workspace"}
        </button>
         <p id="p">Don't have an account? <Link id="a" to={"/register"}>Create one</Link></p>
      </form>
     
    </div>
  );
};

export default Login;
