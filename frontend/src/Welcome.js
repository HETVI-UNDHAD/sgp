import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import squadUpLogo from "./squaduplogo.png";
import axios from "axios";
import "./theme.css";

function Welcome() {
  const navigate = useNavigate();
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const [stats, setStats] = useState({ totalUsers:0, totalGroups:0 });
  const scroll = ref => ref.current?.scrollIntoView({ behavior:"smooth" });

  useEffect(()=>{
    axios.get("http://localhost:5000/api/auth/stats")
      .then(res=>{ if(res.data?.success) setStats({totalUsers:res.data.totalUsers,totalGroups:res.data.totalGroups}); })
      .catch(()=>{});
  },[]);

  return (
    <>
      <div className="lw">
        <nav className="lnav">
          <div className="lnav-brand"><img src={squadUpLogo} alt="logo" /><span>SquadUp</span></div>
          <div className="lnav-links">
            <button onClick={()=>scroll(featuresRef)}>Features</button>
            <button onClick={()=>scroll(aboutRef)}>About</button>
            <button onClick={()=>navigate("/login")} className="lnav-outline">Login</button>
            <button onClick={()=>navigate("/register")} className="lnav-primary">Register</button>
          </div>
        </nav>

        <section className="lhero">
          <div className="lhero-badge">🚀 Student Collaboration Platform</div>
          <h1>Level Up Your<br /><span className="lgrad">Squad</span></h1>
          <p>Smart group management for students & academic teams.<br />Secure. Fast. Professional.</p>
          <div className="lhero-btns">
            <button onClick={()=>navigate("/register")} className="t-btn lhero-cta">Get Started →</button>
            <button onClick={()=>scroll(aboutRef)} className="t-btn-outline lhero-sec">Learn More</button>
          </div>
          <div className="lstats">
            <div className="lstat"><h2>{stats.totalUsers}+</h2><p>Registered Users</p></div>
            <div className="lstat-div" />
            <div className="lstat"><h2>{stats.totalGroups}+</h2><p>Groups Created</p></div>
          </div>
        </section>

        <section className="lfeatures" ref={featuresRef}>
          <div className="lsec-label">FEATURES</div>
          <h2>Everything you need to collaborate</h2>
          <div className="lfeat-grid">
            {[["🔐","Secure Auth","OTP verification & JWT-based login system."],
              ["👥","Group Management","Create groups, manage members & collaborate securely."],
              ["⚡","Real-time Chat","Instant messaging & live updates via Socket.io."],
              ["📊","Smart Dashboard","Track all activities and stats in one place."]
            ].map(([icon,title,desc])=>(
              <div key={title} className="lfeat-card glass">
                <div className="lfeat-icon">{icon}</div>
                <h3>{title}</h3><p>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="labout" ref={aboutRef}>
          <div className="lsec-label">ABOUT</div>
          <h2>About SquadUp</h2>
          <div className="labout-grid">
            {[["Introduction","SquadUp is a modern collaboration platform designed for students and academic teams."],
              ["Problem Statement","Students face challenges managing group projects. SquadUp provides structured collaboration."],
              ["Our Mission","To provide a secure and professional collaboration platform tailored for students."],
              ["Tech Stack","React.js • Node.js • Express.js • MongoDB • JWT • Socket.io"],
              ["Security","OTP verification, JWT authentication and encrypted passwords ensure full data protection."]
            ].map(([title,desc])=>(
              <div key={title} className="labout-card glass"><h3>{title}</h3><p>{desc}</p></div>
            ))}
          </div>
        </section>

        <footer className="lfooter">
          <img src={squadUpLogo} alt="logo" />
          <p>Developed by CE Students · CSPIT · CHARUSAT</p>
          <p className="lfoot-email">projectbyce123@gmail.com</p>
        </footer>
      </div>

      <style>{`
        .lw { min-height:100vh; color:var(--text); background:transparent; }
        .lnav { display:flex; justify-content:space-between; align-items:center; padding:18px 60px; background:rgba(7,7,15,0.75); backdrop-filter:blur(20px); border-bottom:1px solid rgba(255,255,255,0.07); position:sticky; top:0; z-index:100; }
        .lnav-brand { display:flex; align-items:center; gap:10px; font-size:20px; font-weight:700; }
        .lnav-brand img { width:36px; height:36px; border-radius:50%; }
        .lnav-links { display:flex; gap:12px; align-items:center; }
        .lnav-links button { background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:14px; padding:8px 12px; border-radius:8px; transition:color .2s; }
        .lnav-links button:hover { color:var(--text); }
        .lnav-outline { border:1px solid var(--card-border) !important; color:var(--text) !important; padding:8px 18px !important; border-radius:8px; }
        .lnav-primary { background:linear-gradient(135deg,var(--accent),var(--accent2)) !important; color:white !important; padding:8px 18px !important; border-radius:8px; font-weight:600 !important; }

        .lhero { text-align:center; padding:110px 20px 90px; position:relative; }
        .lhero-badge { display:inline-block; background:rgba(124,58,237,0.15); border:1px solid rgba(124,58,237,0.3); color:var(--accent2); padding:6px 16px; border-radius:20px; font-size:13px; font-weight:500; margin-bottom:28px; }
        .lhero h1 { font-size:64px; font-weight:800; line-height:1.1; margin-bottom:20px; letter-spacing:-2px; }
        .lgrad { background:linear-gradient(135deg,var(--accent),var(--accent2),#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .lhero p { font-size:18px; color:var(--text-muted); margin-bottom:40px; line-height:1.7; }
        .lhero-btns { display:flex; justify-content:center; gap:14px; margin-bottom:60px; }
        .lhero-cta { width:auto; padding:14px 32px; font-size:16px; }
        .lhero-sec { padding:14px 32px; font-size:16px; }
        .lstats { display:inline-flex; align-items:center; gap:40px; background:var(--card); border:1px solid var(--card-border); border-radius:20px; padding:24px 48px; backdrop-filter:blur(20px); }
        .lstat { text-align:center; }
        .lstat h2 { font-size:36px; font-weight:800; background:linear-gradient(135deg,var(--accent),var(--accent2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .lstat p { font-size:13px; color:var(--text-muted); margin-top:4px; }
        .lstat-div { width:1px; height:50px; background:var(--card-border); }

        .lsec-label { font-size:12px; font-weight:700; letter-spacing:3px; color:var(--accent2); margin-bottom:12px; }
        .lfeatures { padding:100px 60px; text-align:center; position:relative; }
        .lfeatures h2 { font-size:36px; font-weight:700; margin-bottom:50px; }
        .lfeat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:24px; max-width:1100px; margin:auto; }
        .lfeat-card { padding:36px 28px; text-align:left; transition:transform .3s,box-shadow .3s; }
        .lfeat-card:hover { transform:translateY(-8px); box-shadow:0 20px 40px rgba(124,58,237,0.15); }
        .lfeat-icon { font-size:32px; margin-bottom:16px; }
        .lfeat-card h3 { font-size:17px; font-weight:600; margin-bottom:10px; }
        .lfeat-card p { font-size:14px; color:var(--text-muted); line-height:1.6; }

        .labout { padding:100px 60px; text-align:center; position:relative; }
        .labout h2 { font-size:36px; font-weight:700; margin-bottom:50px; }
        .labout-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:20px; max-width:1100px; margin:auto; }
        .labout-card:nth-child(-n+3) { grid-column:span 2; }
        .labout-card:nth-child(4) { grid-column:2/span 2; }
        .labout-card:nth-child(5) { grid-column:4/span 2; }
        .labout-card { padding:28px; text-align:left; transition:transform .3s; }
        .labout-card:hover { transform:translateY(-6px); }
        .labout-card h3 { font-size:15px; font-weight:600; color:var(--accent2); margin-bottom:10px; }
        .labout-card p { font-size:13px; color:var(--text-muted); line-height:1.7; }

        .lfooter { padding:50px; text-align:center; border-top:1px solid var(--card-border); background:rgba(13,13,26,0.8); backdrop-filter:blur(20px); }
        .lfooter img { width:40px; height:40px; border-radius:50%; margin-bottom:14px; }
        .lfooter p { color:var(--text-muted); font-size:14px; margin-bottom:6px; }
        .lfoot-email { color:var(--accent2) !important; }

        @media(max-width:992px){ .labout-grid{grid-template-columns:repeat(2,1fr);} .labout-card:nth-child(n){grid-column:span 1;} }
        @media(max-width:768px){ .lnav{padding:16px 20px;flex-direction:column;gap:14px;} .lhero h1{font-size:40px;} .lfeatures,.labout{padding:60px 20px;} .labout-grid{grid-template-columns:1fr;} .lstats{flex-direction:column;gap:20px;padding:24px;} .lstat-div{width:60px;height:1px;} }
      `}</style>
    </>
  );
}
export default Welcome;
