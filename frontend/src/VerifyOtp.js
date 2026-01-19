// src/VerifyOtp.js
import { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function maskEmail(email) {
  if (!email) return "";
  if (email.length <= 7) return email;

  const first2 = email.slice(0, 2);
  const last5 = email.slice(-5);
  return `${first2}*****${last5}`;
}

function VerifyOtp() {
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");

  const verifyOtp = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
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
        <h2>OTP Verification</h2>

        <p style={{ marginBottom: "10px", fontSize: "14px" }}>
          OTP sent to <b>{maskEmail(email)}</b>
        </p>

        <input
          placeholder="Enter OTP"
          onChange={(e) => setOtp(e.target.value)}
        />

        <button onClick={verifyOtp}>Verify OTP</button>
      </div>
    </div>
  );
}

export default VerifyOtp;
