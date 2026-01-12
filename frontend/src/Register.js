import { useState } from "react";
import axios from "axios";
import "./Register.css";

function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    enrollment: "",
    course: "",
    semester: "",
    college: "",
  });

  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const register = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      setShowOtp(true);
      alert("OTP sent to email");
    } catch (err) {
      alert(err.response?.data?.msg || "Register error");
    }
  };

  const verifyOtp = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: form.email,
        otp,
      });
      alert("Registration successful 🎉");
    } catch (err) {
      alert(err.response?.data?.msg || "OTP error");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Student Registration</h2>

        <input name="fullName" placeholder="Full Name" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <input name="enrollment" placeholder="Enrollment No" onChange={handleChange} />
        <input name="course" placeholder="Course / Branch" onChange={handleChange} />
        <input name="semester" placeholder="Semester / Year" onChange={handleChange} />
        <input name="college" placeholder="College Name" onChange={handleChange} />

        <button onClick={register}>Register</button>

        {showOtp && (
          <>
            <input placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} />
            <button onClick={verifyOtp}>Verify OTP</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
