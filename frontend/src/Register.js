
import "./Register.css";
import { useState } from "react";
import axios from "axios";



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
      alert("OTP sent to email");
      setShowOtp(true);
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
    <div>
      <input name="fullName" placeholder="Full Name" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <input name="enrollment" placeholder="Enrollment" onChange={handleChange} />
      <input name="course" placeholder="Course" onChange={handleChange} />
      <input name="semester" placeholder="Semester" onChange={handleChange} />
      <input name="college" placeholder="College" onChange={handleChange} />

      <button onClick={register}>Register</button>

      {showOtp && (
        <>
          <input placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} />
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}
    </div>
  );
}

export default Register;
