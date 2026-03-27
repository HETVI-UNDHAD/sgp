import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import squadUpLogo from "./squaduplogo.png";
import "./theme.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show:false, msg:"", type:"" });

  const showToast = (msg, type="success") => { setToast({show:true,msg,type}); setTimeout(()=>setToast({show:false,msg:"",type:""}),3000); };

  const reset = async () => {
    if (password.length<6) { setError("Password must be at least 6 characters"); return; }
    if (password!==confirmPassword) { setError("Passwords do not match"); return; }
    try {
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", { token, password });
      showToast(res.data.msg||"Password reset successful");
      setTimeout(()=>navigate("/login"),1500);
    } catch(err) { showToast(err.response?.data?.msg||"Reset password failed","error"); }
  };

  return (
    <>
      <div className="auth-page">
        <div className="auth-card glass">
          <div className="auth-left">
            <div className="auth-logo"><img src={squadUpLogo} alt="SquadUp" /></div>
            <h1>SquadUp</h1><p>Level Up Your Squad 😉</p>
            <div className="auth-left-dots"><span /><span /><span /></div>
          </div>
          <div className="auth-right">
            <div className="fp-icon">🔒</div>
            <h2>Reset Password</h2>
            <p className="auth-sub">Enter your new password below.</p>
            <div className="auth-field">
              <input type="password" className={`t-input ${error?"err":""}`} placeholder="New Password" value={password}
                onChange={e=>{setPassword(e.target.value);setError("");}} />
            </div>
            <div className="auth-field">
              <input type="password" className={`t-input ${error?"err":""}`} placeholder="Confirm Password" value={confirmPassword}
                onChange={e=>{setConfirmPassword(e.target.value);setError("");}} />
              {error&&<span className="t-err">{error}</span>}
            </div>
            <button className="t-btn" onClick={reset} style={{marginTop:16}}>Reset Password →</button>
            <p className="auth-switch">Back to <Link to="/login" className="t-link">Login</Link></p>
          </div>
        </div>
      </div>
      {toast.show&&<div className={`t-toast ${toast.type}`}>{toast.msg}</div>}
      <style>{`
        .auth-page { min-height:100vh; display:flex; justify-content:center; align-items:center; background:transparent; padding:20px; }
        .auth-card { display:flex; width:820px; min-height:460px; border-radius:24px; overflow:hidden; box-shadow:var(--shadow); }
        .auth-left { width:42%; background:linear-gradient(160deg,#3b0764,#7c3aed); display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:50px 36px; }
        .auth-logo { width:100px; height:100px; border-radius:50%; overflow:hidden; border:3px solid rgba(255,255,255,0.25); box-shadow:0 0 40px rgba(168,85,247,0.5); margin-bottom:20px; }
        .auth-logo img { width:100%; height:100%; object-fit:cover; }
        .auth-left h1 { font-size:28px; font-weight:800; color:white; margin-bottom:8px; }
        .auth-left p { font-size:14px; color:rgba(255,255,255,0.7); }
        .auth-left-dots { display:flex; gap:8px; margin-top:30px; }
        .auth-left-dots span { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.3); }
        .auth-left-dots span:first-child { background:white; }
        .auth-right { width:58%; padding:50px 44px; background:var(--bg2); display:flex; flex-direction:column; justify-content:center; }
        .fp-icon { font-size:36px; margin-bottom:12px; }
        .auth-right h2 { font-size:26px; font-weight:700; margin-bottom:6px; }
        .auth-sub { color:var(--text-muted); font-size:14px; margin-bottom:28px; }
        .auth-field { margin-bottom:14px; }
        .auth-switch { margin-top:20px; text-align:center; font-size:14px; color:var(--text-muted); }
        @media(max-width:700px){ .auth-card{flex-direction:column;width:100%;} .auth-left,.auth-right{width:100%;padding:36px;} }
      `}</style>
    </>
  );
}
export default ResetPassword;
