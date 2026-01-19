// src/Register.js
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    enrollment: "",
    course: "",
    semester: "",
    college: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const register = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      alert("OTP sent to email");

      // 👉 go to verify page with email
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      alert(err.response?.data?.msg || "Register error");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Register</h2>

        <input name="fullName" placeholder="Full Name" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <input name="enrollment" placeholder="Enrollment" onChange={handleChange} />
        <input name="course" placeholder="Course" onChange={handleChange} />
        <input name="semester" placeholder="Semester" onChange={handleChange} />
        <input name="college" placeholder="College" onChange={handleChange} />

        <button onClick={register}>Register</button>
      </div>
    </div>
  );
}

export default Register;
