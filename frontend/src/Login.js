import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import squadUpLogo from "./squaduplogo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5001"}/api/auth/login`,
        { email: email.trim().toLowerCase(), password }
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      showToast("Welcome back! 🎉", "success");
      setTimeout(() => navigate(inviteToken ? `/accept-invite/${inviteToken}` : "/dashboard"), 1000);
    } catch (err) {
      showToast(err.response?.data?.msg || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") login(); };

  return (
    <>
      <div className="auth-page">
        {/* Animated background particles */}
        <div className="particles">
          {[...Array(18)].map((_, i) => <span key={i} className={`p p${i}`} />)}
        </div>

        <div className="auth-card" style={{ animation: "cardIn .6s cubic-bezier(.22,1,.36,1) both" }}>
          {/* LEFT */}
          <div className="auth-left">
            <button className="home-btn" onClick={() => navigate("/")}>← Home</button>
            <div className="auth-logo-ring">
              <img src={squadUpLogo} alt="SquadUp" />
            </div>
            <h1 className="auth-brand">SquadUp</h1>
            <p className="auth-tagline">Level Up Your Squad 😉</p>
            <div className="auth-dots">
              <span className="dot active" /><span className="dot" /><span className="dot" />
            </div>
          </div>

          {/* RIGHT */}
          <div className="auth-right">
            <div className="auth-form-head">
              <h2>Welcome back</h2>
              <p>Sign in to continue</p>
            </div>

            <div className={`auth-field ${errors.email ? "has-error" : ""} ${email ? "filled" : ""}`}>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                onKeyDown={handleKey}
                autoComplete="email"
              />
              <label htmlFor="email">Email address</label>
              <span className="field-icon">✉</span>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className={`auth-field ${errors.password ? "has-error" : ""} ${password ? "filled" : ""}`}>
              <input
                id="password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                onKeyDown={handleKey}
                autoComplete="current-password"
              />
              <label htmlFor="password">Password</label>
              <span className="field-icon toggle-pass" onClick={() => setShowPass(p => !p)}>
                {showPass ? "🙈" : "👁"}
              </span>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="auth-forgot">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button className={`auth-btn ${loading ? "loading" : ""}`} onClick={login} disabled={loading}>
              {loading ? <span className="btn-spinner" /> : "Sign In →"}
            </button>

            <p className="auth-switch">
              Don't have an account? <Link to="/register" state={{ inviteToken }}>Create one</Link>
            </p>
          </div>
        </div>
      </div>

      {toast.show && (
        <div className={`auth-toast ${toast.type}`}>{toast.msg}</div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Poppins', sans-serif; }

        /* ── PAGE ── */
        .auth-page {
          min-height: 100vh;
          background: #060f1e;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }

        /* ── PARTICLES ── */
        .particles { position: absolute; inset: 0; pointer-events: none; }
        .p {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          animation: float linear infinite;
        }
        .p0  { width:8px;  height:8px;  left:5%;   top:20%; animation-duration:14s; animation-delay:0s; }
        .p1  { width:14px; height:14px; left:12%;  top:70%; animation-duration:18s; animation-delay:1s; }
        .p2  { width:6px;  height:6px;  left:22%;  top:40%; animation-duration:12s; animation-delay:2s; }
        .p3  { width:20px; height:20px; left:30%;  top:85%; animation-duration:22s; animation-delay:0.5s; }
        .p4  { width:10px; height:10px; left:40%;  top:10%; animation-duration:16s; animation-delay:3s; }
        .p5  { width:5px;  height:5px;  left:50%;  top:55%; animation-duration:11s; animation-delay:1.5s; }
        .p6  { width:16px; height:16px; left:60%;  top:30%; animation-duration:20s; animation-delay:0s; }
        .p7  { width:8px;  height:8px;  left:70%;  top:75%; animation-duration:15s; animation-delay:2.5s; }
        .p8  { width:12px; height:12px; left:80%;  top:15%; animation-duration:17s; animation-delay:1s; }
        .p9  { width:6px;  height:6px;  left:88%;  top:60%; animation-duration:13s; animation-delay:3.5s; }
        .p10 { width:18px; height:18px; left:95%;  top:45%; animation-duration:21s; animation-delay:0.8s; }
        .p11 { width:9px;  height:9px;  left:15%;  top:90%; animation-duration:19s; animation-delay:2s; }
        .p12 { width:7px;  height:7px;  left:35%;  top:5%;  animation-duration:14s; animation-delay:4s; }
        .p13 { width:11px; height:11px; left:55%;  top:95%; animation-duration:16s; animation-delay:1.2s; }
        .p14 { width:15px; height:15px; left:75%;  top:50%; animation-duration:23s; animation-delay:0.3s; }
        .p15 { width:5px;  height:5px;  left:90%;  top:80%; animation-duration:12s; animation-delay:2.8s; }
        .p16 { width:22px; height:22px; left:8%;   top:50%; animation-duration:25s; animation-delay:1.8s; }
        .p17 { width:4px;  height:4px;  left:48%;  top:25%; animation-duration:10s; animation-delay:0.6s; }

        @keyframes float {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0.06; }
          50%  { opacity: 0.12; }
          100% { transform: translateY(-120px) rotate(360deg); opacity: 0; }
        }

        /* ── CARD ── */
        .auth-card {
          width: 860px;
          max-width: 96vw;
          display: flex;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06);
          position: relative; z-index: 1;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── LEFT ── */
        .auth-left {
          width: 42%;
          background: linear-gradient(160deg, #0d2444 0%, #0b3e71 60%, #0f4d8a 100%);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 36px; text-align: center;
          position: relative; overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.07) 0%, transparent 60%);
        }

        .home-btn {
          position: absolute; top: 18px; left: 18px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.8);
          padding: 7px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 500; cursor: pointer;
          transition: all .2s; z-index: 2;
        }
        .home-btn:hover { background: rgba(255,255,255,0.2); color: #fff; }

        .auth-logo-ring {
          width: 130px; height: 130px;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.2);
          padding: 6px;
          box-shadow: 0 0 0 8px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.4);
          animation: pulse 3s ease-in-out infinite;
          position: relative; z-index: 1;
        }
        .auth-logo-ring img {
          width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 8px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.4); }
          50%      { box-shadow: 0 0 0 16px rgba(255,255,255,0.08), 0 20px 40px rgba(0,0,0,0.4); }
        }

        .auth-brand {
          color: #fff; font-size: 28px; font-weight: 700;
          margin: 20px 0 8px; letter-spacing: 0.5px;
          position: relative; z-index: 1;
        }
        .auth-tagline {
          color: rgba(255,255,255,0.7); font-size: 14px;
          position: relative; z-index: 1;
        }
        .auth-dots { display: flex; gap: 8px; margin-top: 28px; position: relative; z-index: 1; }
        .dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.25);
          transition: all .3s;
        }
        .dot.active { background: #fff; width: 24px; border-radius: 4px; }

        /* ── RIGHT ── */
        .auth-right {
          width: 58%;
          background: #0e1a2e;
          padding: 52px 48px;
          display: flex; flex-direction: column; justify-content: center;
        }

        .auth-form-head { margin-bottom: 32px; }
        .auth-form-head h2 {
          color: #fff; font-size: 26px; font-weight: 700; margin-bottom: 6px;
        }
        .auth-form-head p { color: rgba(255,255,255,0.4); font-size: 14px; }

        /* ── FLOATING LABEL FIELD ── */
        .auth-field {
          position: relative; margin-bottom: 20px;
        }
        .auth-field input {
          width: 100%;
          padding: 18px 44px 8px 16px;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          outline: none;
          transition: border-color .25s, background .25s;
        }
        .auth-field input:focus {
          border-color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.08);
        }
        .auth-field label {
          position: absolute;
          left: 16px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.35);
          font-size: 14px;
          pointer-events: none;
          transition: all .2s ease;
        }
        .auth-field input:focus ~ label,
        .auth-field.filled label {
          top: 10px; transform: none;
          font-size: 11px; color: rgba(255,255,255,0.55);
        }
        .auth-field.has-error input { border-color: rgba(255,100,100,0.6); }
        .field-error {
          font-size: 11px; color: #ff7070;
          margin-top: 5px; display: block; padding-left: 4px;
        }
        .field-icon {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          font-size: 14px; color: rgba(255,255,255,0.3);
          pointer-events: none;
        }
        .toggle-pass { pointer-events: all; cursor: pointer; }

        /* ── FORGOT ── */
        .auth-forgot { text-align: right; margin: -8px 0 20px; }
        .auth-forgot a {
          font-size: 12px; color: rgba(255,255,255,0.4);
          text-decoration: none; transition: color .2s;
        }
        .auth-forgot a:hover { color: rgba(255,255,255,0.75); }

        /* ── BUTTON ── */
        .auth-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #0b3e71, #1565c0);
          color: #fff; border: none; border-radius: 12px;
          font-size: 15px; font-weight: 600; cursor: pointer;
          box-shadow: 0 8px 24px rgba(11,62,113,0.5);
          transition: transform .2s, box-shadow .2s;
          display: flex; align-items: center; justify-content: center;
          min-height: 50px;
        }
        .auth-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(11,62,113,0.65);
        }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn.loading { opacity: 0.8; cursor: not-allowed; }

        .btn-spinner {
          width: 20px; height: 20px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── SWITCH ── */
        .auth-switch {
          margin-top: 20px; text-align: center;
          font-size: 13px; color: rgba(255,255,255,0.35);
        }
        .auth-switch a {
          color: rgba(255,255,255,0.75); font-weight: 600;
          text-decoration: none; transition: color .2s;
        }
        .auth-switch a:hover { color: #fff; }

        /* ── TOAST ── */
        .auth-toast {
          position: fixed; bottom: 28px; right: 28px;
          padding: 13px 20px; border-radius: 12px;
          color: #fff; font-size: 14px; font-weight: 500;
          box-shadow: 0 12px 32px rgba(0,0,0,0.4);
          animation: toastIn .4s cubic-bezier(.22,1,.36,1);
          z-index: 9999;
        }
        .auth-toast.success { background: #0b3e71; border: 1px solid rgba(255,255,255,0.15); }
        .auth-toast.error   { background: #3d1010; border: 1px solid rgba(255,100,100,0.3); }

        @keyframes toastIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 680px) {
          .auth-card { flex-direction: column; }
          .auth-left { width: 100%; padding: 36px 24px; }
          .auth-logo-ring { width: 90px; height: 90px; }
          .auth-brand { font-size: 22px; }
          .auth-right { width: 100%; padding: 36px 24px; }
        }
      `}</style>
    </>
  );
}

export default Login;
