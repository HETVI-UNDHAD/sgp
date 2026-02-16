// src/VerifyOtp.js
import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function maskEmail(email) {
  const [name, domain] = email.split("@");
  return name.slice(0, 2) + "*****@" + domain;
}

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  if (!email) return <h3 style={{ textAlign: "center" }}>Invalid Access</h3>;

  /* ================= TOAST ================= */
  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast({ show: false, msg: "", type: "" });
    }, 3000);
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      showToast("Please enter valid 6-digit OTP", "error");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp,
      });

      showToast("OTP verified successfully 🎉", "success");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (err) {
      showToast(
        err.response?.data?.msg || "Invalid or expired OTP",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="otp-wrapper">
        <div className="otp-card">
          <h2>Verify OTP</h2>
          <p className="sub-text">
            OTP sent to <b>{maskEmail(email)}</b>
          </p>

          <input
            type="text"
            maxLength="6"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ""))
            }
          />

          <button onClick={verifyOtp} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <p className="back-login" onClick={() => navigate("/login")}>
            Back to Login
          </p>
        </div>
      </div>

      {/* TOAST */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.msg}
        </div>
      )}

      {/* ===== CSS ===== */}
      <style>{`
        * {
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        .otp-wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #0b3e71, #1f5fa3);
        }

        .otp-card {
          width: 380px;
          background: white;
          padding: 45px 35px;
          border-radius: 18px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.25);
          text-align: center;
        }

        .otp-card h2 {
          margin-bottom: 10px;
          color: #0b3e71;
        }

        .sub-text {
          font-size: 14px;
          color: #555;
          margin-bottom: 25px;
        }

        .otp-card input {
          width: 100%;
          padding: 14px;
          margin-bottom: 20px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 15px;
          text-align: center;
          letter-spacing: 4px;
        }

        .otp-card input:focus {
          outline: none;
          border-color: #0b3e71;
          box-shadow: 0 0 0 2px rgba(11,62,113,0.2);
        }

        .otp-card button {
          width: 100%;
          padding: 14px;
          background: #0b3e71;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .otp-card button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .otp-card button:hover:not(:disabled) {
          background: #082c50;
        }

        .back-login {
          margin-top: 18px;
          font-size: 13px;
          color: #0b3e71;
          cursor: pointer;
        }

        .back-login:hover {
          text-decoration: underline;
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

        @media (max-width: 450px) {
          .otp-card {
            width: 90%;
          }
        }
      `}</style>
    </>
  );
}

export default VerifyOtp;
