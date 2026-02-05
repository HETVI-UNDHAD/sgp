import { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ get invite token if coming from invite
  const inviteToken = location.state?.inviteToken;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    enrollment: "",
    course: "",
    semester: "",
    college: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const register = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);

      // ✅ After register → OTP page (pass inviteToken forward)
      navigate("/verify-otp", {
        state: {
          email: form.email,
          inviteToken, // ⭐ important
        },
      });
    } catch (err) {
      alert(err.response?.data?.msg || "Register error");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* LEFT */}
        <div className="auth-left">
          <img
            src="https://illustrations.popsy.co/purple/student-at-desk.svg"
            alt="register"
          />
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <h2>Comprehension Assistant</h2>
          <h3>Register</h3>

          <input name="fullName" placeholder="Full Name" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} />
          <input name="enrollment" placeholder="Enrollment No" onChange={handleChange} />
          <input name="course" placeholder="Course" onChange={handleChange} />
          <input name="semester" placeholder="Semester" onChange={handleChange} />
          <input name="college" placeholder="College" onChange={handleChange} />

          <button onClick={register}>Register →</button>

          <p>
            Already have an account?{" "}
            <Link to="/login" state={{ inviteToken }}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
