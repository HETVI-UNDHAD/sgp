import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import squadUpLogo from "./squaduplogo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });

  const navigate = useNavigate();
  const location = useLocation();
  const inviteToken = location.state?.inviteToken;

  /* ================= TOAST ================= */
  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
  };

  /* ================= VALIDATION ================= */
  const validate = () => {
    let newErrors = {};

    if (!email.includes("@")) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= LOGIN ================= */
  const login = async () => {
    if (!validate()) {
      showToast("Please fix highlighted fields", "error");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5001"}/api/auth/login`,
        {
          email: email.trim().toLowerCase(),
          password,
        }
      );

      localStorage.setItem("user", JSON.stringify(res.data.user));

      showToast("Login successful 🎉", "success");

      setTimeout(() => {
        if (inviteToken) {
          navigate(`/accept-invite/${inviteToken}`);
        } else {
          navigate("/dashboard");
        }
      }, 1000);
    } catch (err) {
      console.log("LOGIN ERROR 👉", err.response?.data || err.message);
      showToast(
        err.response?.data?.msg || "Login failed",
        "error"
      );
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="card">

          {/* LEFT PANEL */}
          <div className="left-panel">
            <div className="logo-circle">
              <img src={squadUpLogo} alt="SquadUp Logo" />
            </div>
            <h1>SquadUp</h1>
            <p>Level Up Your SquadUp....😉</p>
          </div>

          {/* RIGHT PANEL */}
          <div className="right-panel">
            <h2>Login</h2>

            <div className="field">
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: "" });
                }}
                className={errors.email ? "error" : ""}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="field">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: "" });
                }}
                className={errors.password ? "error" : ""}
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            {/* 🔑 FORGOT PASSWORD */}
            <div className="forgot">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button onClick={login}>Login →</button>

            <p>
              Don’t have an account?{" "}
              <Link to="/register" state={{ inviteToken }}>
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.msg}
        </div>
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
          width: 900px;
          min-height: 520px;
          display: flex;
          border-radius: 20px;
          overflow: hidden;
          background: white;
          box-shadow: 0 25px 60px rgba(0,0,0,0.15);
        }

        /* LEFT */
        .left-panel {
          width: 45%;
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
          width: 180px;
          height: 180px;
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

        .left-panel h1 {
          margin: 10px 0 6px;
          font-size: 28px;
        }

        .left-panel p {
          font-size: 15px;
          opacity: 0.95;
        }

        /* RIGHT */
        .right-panel {
          width: 55%;
          padding: 40px;
        }

        .right-panel h2 {
          color: #1e2a3a;
          margin-bottom: 24px;
        }

        .field {
          margin-bottom: 14px;
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

        .forgot {
          text-align: right;
          margin-bottom: 16px;
        }

        .forgot a {
          font-size: 13px;
          color: #0b3e71;
          text-decoration: none;
        }

        .right-panel button {
          width: 100%;
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

        /* TOAST */
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

export default Login;
