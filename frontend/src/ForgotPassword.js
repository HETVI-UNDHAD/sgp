import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import squadUpLogo from "./squaduplogo.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
  };

  const submit = async () => {
    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email: email.trim().toLowerCase() }
      );

      showToast(res.data.msg || "Reset link sent to email", "success");
      setError("");
    } catch (err) {
      console.log("FORGOT ERROR 👉", err.response?.data || err.message);
      showToast(
        err.response?.data?.msg || "Something went wrong",
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
            <p>Level Up Your SquadUp....😉</p>
          </div>

          {/* RIGHT */}
          <div className="right-panel">
            <h2>Forgot Password</h2>
            <p className="info">
              Enter your registered email. We’ll send you a reset link.
            </p>

            <div className="field">
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className={error ? "error" : ""}
              />
              {error && <span className="error-text">{error}</span>}
            </div>

            <button onClick={submit}>Send Reset Link →</button>

            <p>
              Remember password? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}

      {/* SAME CSS AS LOGIN/REGISTER */}
      <style>{`
        * { box-sizing: border-box; font-family: Poppins, sans-serif; }

        .page-wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #eef4fb;
        }

        .card {
          width: 900px;
          min-height: 500px;
          display: flex;
          border-radius: 20px;
          overflow: hidden;
          background: white;
          box-shadow: 0 25px 60px rgba(0,0,0,0.15);
        }

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

        .right-panel {
          width: 55%;
          padding: 40px;
        }

        .info {
          font-size: 14px;
          color: #555;
          margin-bottom: 18px;
        }

        .field { margin-bottom: 14px; }

        input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid #d6e3f3;
          outline: none;
        }

        input.error {
          border-color: #e74c3c;
          background: #fff6f6;
        }

        .error-text {
          font-size: 12px;
          color: #e74c3c;
          margin-top: 4px;
          display: block;
        }

        button {
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

        p {
          margin-top: 18px;
          text-align: center;
        }

        a {
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

        .toast.success { background: #2ecc71; }
        .toast.error { background: #e74c3c; }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default ForgotPassword;
