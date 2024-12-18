import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import backgroundImage from "./assets/background.jpg";
//import "./EmployeeLogin.css"; // Custom CSS file for styling

const EmployeeLogin = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Regex patterns for validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format
  const usernamePattern = /^[a-zA-Z0-9_-]{3,20}$/; // Allows alphanumeric characters, underscores, and hyphens (3-20 chars)
  //const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/; // Minimum 8 chars, at least 1 letter and 1 number

  const validateInput = () => {
    if (!formData.identifier) {
      setError("Email or username is required.");
      return false;
    }

    if (emailPattern.test(formData.identifier)) {
      // Email is valid
    } else if (usernamePattern.test(formData.identifier)) {
      // Username is valid
    } else {
      setError("Invalid email or username.");
      return false;
    }

    setError(""); // Clear any previous error message
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInput()) return;

    try {
      const response = await axios.post('https://localhost:3001/api/user/employee/login', formData);

      console.log("Login successful:", response.data);

      localStorage.setItem('employee', JSON.stringify({
        employeeId: response.data.employeeId,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role,
        token: response.data.token,
      }));

      // Redirect to employee dashboard
      navigate("/employee-dashboard");
    } catch (error) {
      console.error("Login error:", error.response?.data?.message || "An error occurred during login");
      setError(error.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.header}>Employee Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.row}>
          <input
            type="text"
            name="identifier"
            placeholder="Email or Username"
            value={formData.identifier}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.row}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
          {showPassword ? (
            <EyeOff style={styles.icon} onClick={togglePasswordVisibility} />
          ) : (
            <Eye style={styles.icon} onClick={togglePasswordVisibility} />
          )}
        </div>
        <button type="submit" style={styles.submitButton}>Login</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "20px",
  },
  form: {
    padding: "30px",
    maxWidth: "400px",
    width: "100%",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  header: {
    textAlign: "center",
    marginBottom: "25px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  row: {
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  passwordInput: {
    width: '100%',
    padding: '12px',
    paddingRight: '40px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  eyeButton: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
  },
  submitButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  forgotSection: {
    textAlign: "center",
    marginTop: "20px",
  },
  forgotButton: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: "15px",
    fontSize: "14px",
  },
};

export default EmployeeLogin;
