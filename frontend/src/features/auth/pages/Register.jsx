import React, { useState } from "react";
import { Link,useNavigate} from "react-router";


const Register = () => {
    const nevigate= useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

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

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Registration failed. Try again.");

      const data = await response.json();
      localStorage.setItem("token", data.token);
    } catch (err) {
      setServerError(err.message);
    }
  };

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