import { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import squadUpLogo from "./squaduplogo.png";
import { API_URL } from "./config";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const inviteToken = location.state?.inviteToken;

  const [form, setForm] = useState({
    fullName: "", email: "", password: "",
    enrollment: "", course: "", semester: "", college: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
  };

  const validate = () => {
    let e = {};
    if (!form.fullName.trim())    e.fullName   = "Full name is required";
    if (!form.email.includes("@")) e.email     = "Enter a valid email";
    if (form.password.length < 6)  e.password  = "Minimum 6 characters";
    if (!form.enrollment.trim())   e.enrollment = "Enrollment number required";
    if (!form.course.trim())       e.course    = "Course is required";
    if (!form.semester.trim())     e.semester  = "Semester is required";
    if (!form.college.trim())      e.college   = "College is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const register = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        fullName:   form.fullName.trim(),
        email:      form.email.trim().toLowerCase(),
        password:   form.password,
        enrollment: form.enrollment.trim(),
        course:     form.course.trim(),
        semester:   form.semester.trim(),
        college:    form.college.trim(),
      });
      showToast(res.data.msg || "OTP sent to email ✉", "success");
      setTimeout(() => navigate("/verify-otp", { state: { email: form.email.trim().toLowerCase(), inviteToken } }), 1200);
    } catch (err) {
      showToast(err.response?.data?.msg || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "fullName",   label: "Full Name",       icon: "👤", type: "text" },
    { name: "email",      label: "Email address",   icon: "✉",  type: "email" },
    { name: "password",   label: "Password",        icon: null, type: showPass ? "text" : "password", toggle: true },
    { name: "enrollment", label: "Enrollment No.",  icon: "🎓", type: "text" },
    { name: "course",     label: "Course",          icon: "📚", type: "text" },
    { name: "semester",   label: "Semester",        icon: "📅", type: "text" },
    { name: "college",    label: "College",         icon: "🏫", type: "text" },
  ];

  return (
    <>
      <div className="auth-page">
        <div className="particles">
          {[...Array(18)].map((_, i) => <span key={i} className={`p p${i}`} />)}
        </div>

        <div className="auth-card reg-card" style={{ animation: "cardIn .6s cubic-bezier(.22,1,.36,1) both" }}>
          {/* LEFT */}
          <div className="auth-left">
            <button className="home-btn" onClick={() => navigate("/")}>← Home</button>
            <div className="auth-logo-ring">
              <img src={squadUpLogo} alt="SquadUp" />
            </div>
            <h1 className="auth-brand">SquadUp</h1>
            <p className="auth-tagline">Level Up Your Squad 😉</p>
            <ul className="auth-perks">
              <li>✓ Group messaging</li>
              <li>✓ File sharing</li>
              <li>✓ Video calls</li>
              <li>✓ Real-time updates</li>
            </ul>
          </div>

          {/* RIGHT */}
          <div className="auth-right">
            <div className="auth-form-head">
              <h2>Create account</h2>
              <p>Join your squad today</p>
            </div>

            <div className="reg-grid">
              {fields.map(({ name, label, icon, type, toggle }) => (
                <div
                  key={name}
                  className={`auth-field ${name === "fullName" || name === "college" ? "full" : ""} ${errors[name] ? "has-error" : ""} ${form[name] ? "filled" : ""}`}
                >
                  <input
                    id={name}
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={handleChange}
                    autoComplete={name === "password" ? "new-password" : name}
                  />
                  <label htmlFor={name}>{label}</label>
                  {toggle ? (
                    <span className="field-icon toggle-pass" onClick={() => setShowPass(p => !p)}>
                      {showPass ? "🙈" : "👁"}
                    </span>
                  ) : icon ? (
                    <span className="field-icon">{icon}</span>
                  ) : null}
                  {errors[name] && <span className="field-error">{errors[name]}</span>}
                </div>
              ))}
            </div>

            <button className={`auth-btn ${loading ? "loading" : ""}`} onClick={register} disabled={loading}>
              {loading ? <span className="btn-spinner" /> : "Create Account →"}
            </button>

            <p className="auth-switch">
              Already have an account? <Link to="/login" state={{ inviteToken }}>Sign in</Link>
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

        .auth-page {
          min-height: 100vh;
          background: #060f1e;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden; padding: 24px 0;
        }

        /* PARTICLES */
        .particles { position: absolute; inset: 0; pointer-events: none; }
        .p {
          position: absolute; border-radius: 50%;
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

        /* CARD */
        .auth-card {
          width: 860px; max-width: 96vw;
          display: flex; border-radius: 24px; overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06);
          position: relative; z-index: 1;
        }
        .reg-card { width: 960px; }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* LEFT */
        .auth-left {
          width: 38%;
          background: linear-gradient(160deg, #0d2444 0%, #0b3e71 60%, #0f4d8a 100%);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 32px; text-align: center;
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
          width: 110px; height: 110px; border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.2); padding: 6px;
          box-shadow: 0 0 0 8px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.4);
          animation: pulse 3s ease-in-out infinite;
          position: relative; z-index: 1;
        }
        .auth-logo-ring img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }

        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 8px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.4); }
          50%      { box-shadow: 0 0 0 16px rgba(255,255,255,0.08), 0 20px 40px rgba(0,0,0,0.4); }
        }

        .auth-brand {
          color: #fff; font-size: 26px; font-weight: 700;
          margin: 18px 0 6px; position: relative; z-index: 1;
        }
        .auth-tagline {
          color: rgba(255,255,255,0.65); font-size: 13px;
          position: relative; z-index: 1;
        }

        .auth-perks {
          list-style: none; margin-top: 28px; text-align: left;
          position: relative; z-index: 1;
        }
        .auth-perks li {
          color: rgba(255,255,255,0.7); font-size: 13px;
          padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .auth-perks li:last-child { border-bottom: none; }

        /* RIGHT */
        .auth-right {
          width: 62%; background: #0e1a2e;
          padding: 44px 48px;
          display: flex; flex-direction: column; justify-content: center;
        }

        .auth-form-head { margin-bottom: 24px; }
        .auth-form-head h2 { color: #fff; font-size: 24px; font-weight: 700; margin-bottom: 4px; }
        .auth-form-head p  { color: rgba(255,255,255,0.4); font-size: 13px; }

        /* GRID */
        .reg-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px 16px;
          margin-bottom: 20px;
        }
        .auth-field.full { grid-column: 1 / -1; }

        /* FLOATING LABEL */
        .auth-field { position: relative; }
        .auth-field input {
          width: 100%;
          padding: 18px 40px 8px 14px;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff; font-size: 14px; outline: none;
          transition: border-color .25s, background .25s;
        }
        .auth-field input:focus {
          border-color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.08);
        }
        .auth-field label {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.3); font-size: 13px;
          pointer-events: none; transition: all .2s ease;
        }
        .auth-field input:focus ~ label,
        .auth-field.filled label {
          top: 9px; transform: none;
          font-size: 10px; color: rgba(255,255,255,0.5);
        }
        .auth-field.has-error input { border-color: rgba(255,100,100,0.5); }
        .field-error {
          font-size: 10px; color: #ff7070;
          margin-top: 4px; display: block; padding-left: 2px;
        }
        .field-icon {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          font-size: 13px; color: rgba(255,255,255,0.25);
          pointer-events: none;
        }
        .toggle-pass { pointer-events: all; cursor: pointer; }

        /* BUTTON */
        .auth-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #0b3e71, #1565c0);
          color: #fff; border: none; border-radius: 12px;
          font-size: 15px; font-weight: 600; cursor: pointer;
          box-shadow: 0 8px 24px rgba(11,62,113,0.5);
          transition: transform .2s, box-shadow .2s;
          display: flex; align-items: center; justify-content: center;
          min-height: 48px;
        }
        .auth-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(11,62,113,0.65);
        }
        .auth-btn.loading { opacity: 0.8; cursor: not-allowed; }

        .btn-spinner {
          width: 20px; height: 20px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-switch {
          margin-top: 16px; text-align: center;
          font-size: 13px; color: rgba(255,255,255,0.35);
        }
        .auth-switch a {
          color: rgba(255,255,255,0.75); font-weight: 600;
          text-decoration: none; transition: color .2s;
        }
        .auth-switch a:hover { color: #fff; }

        /* TOAST */
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

        /* RESPONSIVE */
        @media (max-width: 720px) {
          .auth-card, .reg-card { flex-direction: column; }
          .auth-left { width: 100%; padding: 32px 24px; }
          .auth-logo-ring { width: 80px; height: 80px; }
          .auth-right { width: 100%; padding: 32px 20px; }
          .reg-grid { grid-template-columns: 1fr; }
          .auth-field.full { grid-column: 1; }
        }
      `}</style>
    </>
  );
}

export default Register;
