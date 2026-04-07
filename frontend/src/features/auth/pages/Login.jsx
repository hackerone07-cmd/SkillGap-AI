
import React, { useState } from "react";
import "../auth.form.scss"
import { useNavigate,Link } from "react-router";
import { useAuth } from "../hooks/useAuth";


const Login = () => {


  const {loading,handleLogin} = useAuth();
    
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

  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  try {
    await handleLogin({
      email: email.trim(),
      password: password.trim()
    });

    navigate("/dashboard");
  } catch (err) {
    setServerError(err.message || "Login failed");
  }
};


if(loading){
  return (<main><h1>Loading...</h1></main>)
}
    

  return (
    <div id="form-container">
      <form onSubmit={handleSubmit} id="form-box">
        <h2 id="form-title">Login</h2>

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

        <button id="form-button" type="submit">Login</button>
         <p id="p">don't have an account? <Link id="a" to={"/register"}>Register</Link></p>
      </form>
     
    </div>
  );
};

export default Login;