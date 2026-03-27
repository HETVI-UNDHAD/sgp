import { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import squadUpLogo from "./squaduplogo.png";
import { API_URL } from "./config";
import "./theme.css";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const inviteToken = location.state?.inviteToken;
  const [form, setForm] = useState({ fullName:"", email:"", password:"", enrollment:"", course:"", semester:"", college:"" });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show:false, msg:"", type:"" });

  const handleChange = e => { setForm({...form,[e.target.name]:e.target.value}); setErrors({...errors,[e.target.name]:""}); };
  const showToast = (msg, type="success") => { setToast({show:true,msg,type}); setTimeout(()=>setToast({show:false,msg:"",type:""}),3000); };

  const validate = () => {
    let e = {};
    if (!form.fullName.trim()) e.fullName="Full name is required";
    if (!form.email.includes("@")) e.email="Enter valid email";
    if (form.password.length<6) e.password="Minimum 6 characters";
    if (!form.enrollment.trim()) e.enrollment="Enrollment number required";
    if (!form.course.trim()) e.course="Course is required";
    if (!form.semester.trim()) e.semester="Semester is required";
    if (!form.college.trim()) e.college="College is required";
    setErrors(e); return Object.keys(e).length===0;
  };

  const register = async () => {
    if (!validate()) { showToast("Please fix highlighted fields","error"); return; }
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        fullName:form.fullName.trim(), email:form.email.trim().toLowerCase(),
        password:form.password, enrollment:form.enrollment.trim(),
        course:form.course.trim(), semester:form.semester.trim(), college:form.college.trim()
      });
      showToast(res.data.msg||"OTP sent to email");
      setTimeout(()=>navigate("/verify-otp",{state:{email:form.email.trim().toLowerCase(),inviteToken}}),1200);
    } catch(err) { showToast(err.response?.data?.msg||"Registration failed","error"); }
  };

  const fields = [
    ["fullName","Full Name"],["email","Email"],["password","Password","password"],
    ["enrollment","Enrollment No"],["course","Course"],["semester","Semester"],["college","College"],
  ];

  return (
    <>
      <div className="auth-page">
        <div className="auth-card glass">
          <div className="auth-left">
            <div className="auth-logo"><img src={squadUpLogo} alt="SquadUp" /></div>
            <h1>SquadUp</h1>
            <p>Join the squad today 😉</p>
            <div className="auth-left-dots"><span /><span /><span /></div>
          </div>
          <div className="auth-right reg-right">
            <h2>Create account</h2>
            <p className="auth-sub">Fill in your details to get started</p>
            <div className="reg-grid">
              {fields.map(([name,label,type])=>(
                <div key={name} className="auth-field">
                  <input name={name} type={type||"text"} placeholder={label} onChange={handleChange} className={`t-input ${errors[name]?"err":""}`} />
                  {errors[name]&&<span className="t-err">{errors[name]}</span>}
                </div>
              ))}
            </div>
            <button className="t-btn" onClick={register} style={{marginTop:"8px"}}>Register →</button>
            <p className="auth-switch">Already have an account? <Link to="/login" state={{inviteToken}} className="t-link">Login</Link></p>
          </div>
        </div>
      </div>
      {toast.show&&<div className={`t-toast ${toast.type}`}>{toast.msg}</div>}
      <style>{`
        .auth-page { min-height:100vh; display:flex; justify-content:center; align-items:center; background:transparent; padding:20px; }
        .auth-card { display:flex; width:900px; min-height:560px; border-radius:24px; overflow:hidden; box-shadow:var(--shadow); }
        .auth-left { width:38%; background:linear-gradient(160deg,#3b0764,#7c3aed); display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:50px 30px; }
        .auth-logo { width:90px; height:90px; border-radius:50%; overflow:hidden; border:3px solid rgba(255,255,255,0.25); box-shadow:0 0 40px rgba(168,85,247,0.5); margin-bottom:20px; }
        .auth-logo img { width:100%; height:100%; object-fit:cover; }
        .auth-left h1 { font-size:26px; font-weight:800; color:white; margin-bottom:8px; }
        .auth-left p { font-size:14px; color:rgba(255,255,255,0.7); }
        .auth-left-dots { display:flex; gap:8px; margin-top:28px; }
        .auth-left-dots span { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.3); }
        .auth-left-dots span:first-child { background:white; }
        .auth-right { width:62%; padding:44px; background:var(--bg2); display:flex; flex-direction:column; justify-content:center; }
        .auth-right h2 { font-size:24px; font-weight:700; margin-bottom:6px; }
        .auth-sub { color:var(--text-muted); font-size:14px; margin-bottom:24px; }
        .auth-field { margin-bottom:12px; }
        .auth-switch { margin-top:18px; text-align:center; font-size:14px; color:var(--text-muted); }
        .reg-grid { display:grid; grid-template-columns:1fr 1fr; gap:0 16px; }
        .reg-grid .auth-field:first-child, .reg-grid .auth-field:nth-child(2), .reg-grid .auth-field:nth-child(3) { grid-column:span 2; }
        @media(max-width:700px){ .auth-card{flex-direction:column;width:100%;} .auth-left,.auth-right{width:100%;padding:32px;} .reg-grid{grid-template-columns:1fr;} .reg-grid .auth-field:first-child,.reg-grid .auth-field:nth-child(3){grid-column:span 1;} }
      `}</style>
    </>
  );
}
export default Register;
