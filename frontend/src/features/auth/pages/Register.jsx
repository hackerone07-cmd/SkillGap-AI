import React, { useState } from "react";
import { Link,useNavigate} from "react-router";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
    const navigate= useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const {loading,handleRegister}= useAuth();

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm your password";
    else if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = "Passwords do not match";

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
    await handleRegister({username,email,password})
    navigate("/Dashboard")

  };

 if(loading){
  return (<main><h1>Loading...</h1></main>)
}

  return (
    <div id="form-container">
      <form onSubmit={handleSubmit} id="form-box">
        <h2 id="form-title">Register</h2>

        {serverError && <p id="server-error">{serverError}</p>}

        <input
          id="name-input"
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <p id="name-error">{errors.name}</p>}

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

        <input
          id="confirm-password-input"
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && <p id="confirm-password-error">{errors.confirmPassword}</p>}

        <button id="form-button" type="submit">Register</button>
     <p id="p">Already have an account? <Link id="a" to={"/login"}>Login</Link></p>
      </form>
    </div>
  );
};

export default Register;