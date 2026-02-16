import { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import squadUpLogo from "./squaduplogo.png";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  /* ================= TOAST ================= */
  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
  };

  /* ================= VALIDATION ================= */
  const validate = () => {
    let newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.includes("@")) newErrors.email = "Enter valid email";
    if (form.password.length < 6)
      newErrors.password = "Minimum 6 characters";
    if (!form.enrollment.trim())
      newErrors.enrollment = "Enrollment number required";
    if (!form.course.trim()) newErrors.course = "Course is required";
    if (!form.semester.trim()) newErrors.semester = "Semester is required";
    if (!form.college.trim()) newErrors.college = "College is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= REGISTER ================= */
  const register = async () => {
    if (!validate()) {
      showToast("Please fix highlighted fields", "error");
      return;
    }

    // 🔑 BACKEND-SAFE PAYLOAD
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      enrollment: form.enrollment.trim(),
      course: form.course.trim(),
      semester: form.semester.trim(),
      college: form.college.trim(),
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        payload
      );

      showToast(res.data.msg || "OTP sent to email", "success");

      setTimeout(() => {
        navigate("/verify-otp", {
          state: { email: payload.email, inviteToken },
        });
      }, 1200);
    } catch (err) {
      console.log("REGISTER ERROR 👉", err.response?.data || err.message);
      showToast(
        err.response?.data?.msg || "Registration failed",
        "error"
      );
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="card">

          {/* LEFT */}
          <div className="left-panel">
            <div className="logo-circle">
              <img src={squadUpLogo} alt="SquadUp Logo" />
            </div>
            <h1>SquadUp</h1>
            <p>Level Up Your Squad....😉</p>
          </div>

          {/* RIGHT */}
          <div className="right-panel">
            <h2>Register</h2>

            {[
              ["fullName", "Full Name"],
              ["email", "Email"],
              ["password", "Password", "password"],
              ["enrollment", "Enrollment No"],
              ["course", "Course"],
              ["semester", "Semester"],
              ["college", "College"],
            ].map(([name, label, type]) => (
              <div className="field" key={name}>
                <input
                  name={name}
                  type={type || "text"}
                  placeholder={label}
                  onChange={handleChange}
                  className={errors[name] ? "error" : ""}
                />
                {errors[name] && (
                  <span className="error-text">{errors[name]}</span>
                )}
              </div>
            ))}

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

      {/* TOAST */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}

      {/* CSS */}
      <style>{`
        * {
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        .page-wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #eef4fb;
        }

        .card {
          width: 950px;
          min-height: 560px;
          display: flex;
          border-radius: 20px;
          overflow: hidden;
          background: white;
          box-shadow: 0 25px 60px rgba(0,0,0,0.15);
        }

        .left-panel {
          width: 42%;
          background: linear-gradient(160deg, #0b3e71, #1f5fa3);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 40px;
        }

        .logo-circle {
          width: 190px;
          height: 190px;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 18px 35px rgba(0,0,0,0.35);
          margin-bottom: 20px;
        }

        .logo-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .right-panel {
          width: 58%;
          padding: 40px;
        }

        .right-panel h2 {
          color: #1e2a3a;
          margin-bottom: 22px;
        }

        .field {
          margin-bottom: 12px;
        }

        .right-panel input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid #d6e3f3;
          outline: none;
        }

        .right-panel input.error {
          border-color: #e74c3c;
          background: #fff6f6;
        }

        .error-text {
          font-size: 12px;
          color: #e74c3c;
          margin-top: 4px;
          display: block;
        }

        .right-panel button {
          width: 100%;
          margin-top: 16px;
          padding: 14px;
          border-radius: 10px;
          border: none;
          background: #0b3e71;
          color: white;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(11,62,113,0.4);
        }

        .right-panel p {
          margin-top: 18px;
          text-align: center;
        }

        .right-panel a {
          color: #0b3e71;
          text-decoration: none;
          font-weight: 500;
        }

        .toast {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 14px 20px;
          border-radius: 10px;
          color: white;
          font-size: 14px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.25);
          animation: slideIn 0.4s ease;
        }

        .toast.success {
          background: #2ecc71;
        }

        .toast.error {
          background: #e74c3c;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

export default Register;
