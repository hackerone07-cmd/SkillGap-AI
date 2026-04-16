import React, { useState } from "react";
import { Link,useNavigate, Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "../auth.form.scss";
import PageLoader from "../../../components/PageLoader";

const Register = () => {
    const navigate= useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const {user, isInitializing, isAuthenticating, handleRegister}= useAuth();

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";


    return newErrors;
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setServerError("");

    const username = formData.username;
    const email =formData.email;
    const password= formData.password;
    const result = await handleRegister({username,email,password});

    if (result.success) {
      navigate("/workspace");
      return;
    }

    setServerError(result.message || "Registration failed");

  };

 if(isInitializing){
  return (
    <PageLoader
      eyebrow="Session check"
      title="Setting up registration"
      description="We’re making sure your workspace is ready for a new account."
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
        <h2 id="form-title">Create your account</h2>
        <p id="form-subtitle">Start saving role-fit analyses, interview questions, and preparation roadmaps.</p>

        {serverError && <p id="server-error">{serverError}</p>}

        <input
          id="name-input"
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && <p id="name-error">{errors.username}</p>}

        <input
          id="email-input"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p id="email-error">{errors.email}</p>}

        <input
          id="password-input"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <p id="password-error">{errors.password}</p>}

        <button id="form-button" type="submit" disabled={isAuthenticating}>
          {isAuthenticating ? "Creating account..." : "Create workspace"}
        </button>
     <p id="p">Already have an account? <Link id="a" to={"/login"}>Sign in</Link></p>
      </form>
    </div>
  );
};

export default Register;
