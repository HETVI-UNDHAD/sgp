import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import squadUpLogo from "./squaduplogo.png";
import { API_URL } from "./config";
import "./theme.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });

  const navigate = useNavigate();
  const location = useLocation();
  const inviteToken = location.state?.inviteToken;

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
  };

  const validate = () => {
    let e = {};
    if (!email.includes("@")) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const login = async () => {
    if (!validate()) { showToast("Please fix highlighted fields", "error"); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email: email.trim().toLowerCase(), password,
      });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      showToast("Login successful 🎉");
      setTimeout(() => navigate(inviteToken ? `/accept-invite?token=${inviteToken}` : "/dashboard"), 1000);
    } catch (err) {
      showToast(err.response?.data?.msg || "Login failed", "error");
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="auth-page">
        <div className="auth-card glass">
          <div className="auth-left">
            <div className="auth-logo"><img src={squadUpLogo} alt="SquadUp" /></div>
            <h1>SquadUp</h1>
            <p>Level Up Your Squad 😉</p>
            <div className="auth-left-dots"><span /><span /><span /></div>
          </div>
          <div className="auth-right">
            <h2>Welcome back</h2>
            <p className="auth-sub">Sign in to your account</p>
            <div className="auth-field">
              <input className={`t-input ${errors.email ? "err" : ""}`} placeholder="Email address" value={email}
                onChange={e => { setEmail(e.target.value); setErrors({ ...errors, email: "" }); }} />
              {errors.email && <span className="t-err">{errors.email}</span>}
            </div>
            <div className="auth-field">
              <input type="password" className={`t-input ${errors.password ? "err" : ""}`} placeholder="Password" value={password}
                onChange={e => { setPassword(e.target.value); setErrors({ ...errors, password: "" }); }} />
              {errors.password && <span className="t-err">{errors.password}</span>}
            </div>
            <div className="auth-forgot"><Link to="/forgot-password" className="t-link">Forgot password?</Link></div>
            <button className="t-btn" onClick={login} disabled={loading}>{loading ? "Signing in..." : "Sign In →"}</button>
            <p className="auth-switch">Don't have an account? <Link to="/register" state={{ inviteToken }} className="t-link">Register</Link></p>
          </div>
        </div>
      </div>
      {toast.show && <div className={`t-toast ${toast.type}`}>{toast.msg}</div>}
      <style>{`
        .auth-page { min-height:100vh; display:flex; justify-content:center; align-items:center; background:transparent; padding:20px; }
        .auth-card { display:flex; width:860px; min-height:500px; border-radius:24px; overflow:hidden; box-shadow:var(--shadow); }
        .auth-left { width:42%; background:linear-gradient(160deg,#3b0764,#7c3aed); display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:50px 36px; }
        .auth-logo { width:100px; height:100px; border-radius:50%; overflow:hidden; border:3px solid rgba(255,255,255,0.25); box-shadow:0 0 40px rgba(168,85,247,0.5); margin-bottom:20px; }
        .auth-logo img { width:100%; height:100%; object-fit:cover; }
        .auth-left h1 { font-size:28px; font-weight:800; color:white; margin-bottom:8px; }
        .auth-left p { font-size:14px; color:rgba(255,255,255,0.7); }
        .auth-left-dots { display:flex; gap:8px; margin-top:30px; }
        .auth-left-dots span { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.3); }
        .auth-left-dots span:first-child { background:white; }
        .auth-right { width:58%; padding:50px 44px; background:var(--bg2); display:flex; flex-direction:column; justify-content:center; }
        .auth-right h2 { font-size:26px; font-weight:700; margin-bottom:6px; }
        .auth-sub { color:var(--text-muted); font-size:14px; margin-bottom:30px; }
        .auth-field { margin-bottom:16px; }
        .auth-forgot { text-align:right; margin-bottom:20px; font-size:13px; }
        .auth-switch { margin-top:20px; text-align:center; font-size:14px; color:var(--text-muted); }
        @media(max-width:700px){ .auth-card{flex-direction:column;width:100%;} .auth-left,.auth-right{width:100%;padding:36px;} }
      `}</style>
    </>
  );
}
export default Login;
