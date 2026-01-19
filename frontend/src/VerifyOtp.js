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
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const verifyOtp = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp,
      });

      alert("OTP verified successfully");
      navigate("/login"); // ✅ redirect to login
    } catch (err) {
      alert(err.response?.data?.msg || "OTP error");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h3>Verify OTP</h3>
        <p>OTP sent to <b>{maskEmail(email)}</b></p>

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
