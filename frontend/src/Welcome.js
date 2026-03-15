import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import squadUpLogo from "./squaduplogo.png";
import axios from "axios";
import { API_URL } from "./config";

function Welcome() {
  const navigate = useNavigate();
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalGroups: 0 });

  useEffect(() => {
    axios.get(`${API_URL}/api/auth/stats`).then(res => {
      if (res.data?.success) setStats({ totalUsers: res.data.totalUsers, totalGroups: res.data.totalGroups });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".anim").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scroll = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  const features = [
    { icon: "🔐", title: "Secure Auth",        desc: "OTP email verification & JWT-based login keeps your account safe." },
    { icon: "👥", title: "Group Management",   desc: "Create groups, invite members via email, manage everything in one place." },
    { icon: "💬", title: "Real-time Chat",      desc: "Instant messaging with file sharing, photos, videos & read receipts." },
    { icon: "📹", title: "Video Meetings",      desc: "One-click Google Meet integration with automatic email invitations." },
    { icon: "📁", title: "File Sharing",        desc: "Share documents, images and videos securely within your group." },
    { icon: "📊", title: "Dashboard",           desc: "Track all your groups, members and activities from one dashboard." },
  ];

  const abouts = [
    { icon: "💡", title: "Introduction",       desc: "SquadUp is a modern collaboration platform designed for students and academic teams." },
    { icon: "🎯", title: "Problem Statement",  desc: "Students struggle with scattered tools. SquadUp unifies communication and collaboration." },
    { icon: "🚀", title: "Our Mission",        desc: "Provide a secure, professional collaboration platform tailored for students." },
    { icon: "🛠️", title: "Tech Stack",         desc: "React.js • Node.js • Express.js • MongoDB • Socket.IO • JWT • Nodemailer" },
    { icon: "🔒", title: "Security",           desc: "OTP verification, JWT tokens and bcrypt-encrypted passwords protect your data." },
  ];

  const steps = [
    { n: "01", t: "Register",       d: "Create your account with email OTP verification" },
    { n: "02", t: "Create Group",   d: "Set up your squad and invite members via email" },
    { n: "03", t: "Collaborate",    d: "Chat, share files and start video meetings instantly" },
  ];

  return (
    <>
      <div className="lw">

        {/* 0.5rem gap above nav */}
        <div className="nav-spacer" />

        {/* ── NAVBAR — fixed, never scrolls ── */}
        <nav className="nav">
          <div className="nav-brand">
            <img src={squadUpLogo} alt="logo" className="nav-logo" />
            <span>SquadUp</span>
          </div>
          <div className="nav-links">
            <button onClick={() => scroll(featuresRef)}>Features</button>
            <button onClick={() => scroll(aboutRef)}>About</button>
            <button onClick={() => navigate("/login")} className="btn-outline">Login</button>
            <button onClick={() => navigate("/register")} className="btn-solid">Get Started</button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="hero">
          {[...Array(6)].map((_, i) => <div key={i} className={`particle p${i}`} />)}
          <div className="hero-badge">🎓 Built for Students &amp; Teams</div>
          <h1 className="hero-h1">
            Collaborate Smarter<br />
            <span className="hero-gradient">with SquadUp</span>
          </h1>
          <p className="hero-sub">
            The all-in-one platform for group chats, file sharing, and video meetings.
            Secure. Fast. Professional.
          </p>
          <div className="hero-btns">
            <button onClick={() => navigate("/register")} className="hbtn-primary">Get Started Free →</button>
            <button onClick={() => scroll(featuresRef)} className="hbtn-secondary">See Features</button>
          </div>
          <div className="hero-stats">
            <div className="hstat"><span className="hstat-num">{stats.totalUsers}+</span><span className="hstat-label">Users</span></div>
            <div className="hstat-div" />
            <div className="hstat"><span className="hstat-num">{stats.totalGroups}+</span><span className="hstat-label">Groups</span></div>
            <div className="hstat-div" />
            <div className="hstat"><span className="hstat-num">100%</span><span className="hstat-label">Secure</span></div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="features-sec" ref={featuresRef}>
          <div className="sec-label">FEATURES</div>
          <h2 className="sec-title">Everything Your Team Needs</h2>
          <p className="sec-sub">Powerful tools built for seamless academic collaboration</p>
          <div className="feat-grid">
            {features.map((f, i) => (
              <div key={i} className="feat-card anim" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feat-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="how-sec">
          <div className="sec-label">HOW IT WORKS</div>
          <h2 className="sec-title" style={{ color: "#fff" }}>Up &amp; Running in Minutes</h2>
          <div className="steps">
            {steps.map((s, i) => (
              <div key={i} className="step anim" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="step-num">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section className="about-sec" ref={aboutRef}>
          <div className="sec-label">ABOUT</div>
          <h2 className="sec-title">About SquadUp</h2>
          <div className="about-grid">
            {abouts.map((a, i) => (
              <div key={i} className="about-card anim" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="about-icon">{a.icon}</div>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-sec">
          <h2>Ready to Squad Up?</h2>
          <p>Join students already collaborating smarter with SquadUp</p>
          <button onClick={() => navigate("/register")} className="cta-btn">Create Free Account →</button>
        </section>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="footer-brand">
            <img src={squadUpLogo} alt="logo" />
            <span>SquadUp</span>
          </div>
          <p>Developed by CE Students | CSPIT | CHARUSAT</p>
          <p>📧 projectbyce123@gmail.com</p>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; font-family:'Poppins',sans-serif; }
        .lw { background:#0b3e71; color:#fff; overflow-x:hidden; }

        /* ── NAV SPACER ── */
        .nav-spacer {
          height: 0.5rem;
          background: #071e38;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 201;
        }

        /* ── NAVBAR — fixed, 0.5rem from top, never scrolls ── */
        .nav {
          position: fixed;
          top: 0.5rem;
          left: 0; right: 0;
          z-index: 200;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 60px;
          background: rgba(7,30,56,0.95);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .nav-brand { display:flex; align-items:center; gap:10px; font-size:20px; font-weight:700; }
        .nav-logo { width:38px; height:38px; border-radius:50%; object-fit:cover; }
        .nav-links { display:flex; align-items:center; gap:18px; }
        .nav-links button { background:none; border:none; color:#fff; cursor:pointer; font-size:14px; font-weight:500; transition:.2s; padding:6px 4px; }
        .nav-links button:hover { opacity:.7; }
        .btn-outline { border:1.5px solid rgba(255,255,255,.6) !important; padding:7px 18px !important; border-radius:8px !important; }
        .btn-solid { background:#fff !important; color:#0b3e71 !important; padding:8px 20px !important; border-radius:8px !important; font-weight:700 !important; }
        .btn-solid:hover { background:#e3eeff !important; opacity:1 !important; }

        /* ── HERO — top padding clears fixed nav + spacer ── */
        .hero {
          text-align: center;
          padding: 150px 20px 90px;
          background: linear-gradient(160deg, #0b3e71 0%, #071e38 100%);
          position: relative;
          overflow: hidden;
        }

        /* PARTICLES */
        .particle { position:absolute; border-radius:50%; pointer-events:none; opacity:.12; animation:floatP 12s ease-in-out infinite; }
        .p0{width:80px;height:80px;background:#4fc3f7;top:10%;left:5%;animation-delay:0s}
        .p1{width:50px;height:50px;background:#26c6da;top:30%;right:8%;animation-delay:2s}
        .p2{width:100px;height:100px;background:#7e57c2;top:60%;left:3%;animation-delay:4s}
        .p3{width:60px;height:60px;background:#26a69a;bottom:20%;right:5%;animation-delay:1s}
        .p4{width:40px;height:40px;background:#ef5350;top:80%;left:50%;animation-delay:3s}
        .p5{width:70px;height:70px;background:#ffa726;top:45%;right:20%;animation-delay:5s}
        @keyframes floatP{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-30px) rotate(180deg)}}

        .hero-badge { display:inline-block; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.25); padding:6px 18px; border-radius:20px; font-size:13px; margin-bottom:24px; backdrop-filter:blur(8px); position:relative; z-index:1; }
        .hero-h1 { font-size:56px; font-weight:800; line-height:1.15; margin-bottom:20px; position:relative; z-index:1; }
        .hero-gradient { background:linear-gradient(90deg,#4fc3f7,#26c6da,#80deea); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .hero-sub { font-size:17px; opacity:.85; max-width:560px; margin:0 auto 36px; line-height:1.7; position:relative; z-index:1; }
        .hero-btns { display:flex; justify-content:center; gap:16px; margin-bottom:48px; position:relative; z-index:1; }
        .hbtn-primary { background:#fff; color:#0b3e71; border:none; padding:14px 32px; border-radius:50px; font-size:15px; font-weight:700; cursor:pointer; box-shadow:0 8px 24px rgba(0,0,0,.2); transition:.25s; }
        .hbtn-primary:hover { transform:translateY(-3px); box-shadow:0 14px 32px rgba(0,0,0,.3); }
        .hbtn-secondary { background:transparent; border:2px solid rgba(255,255,255,.5); color:#fff; padding:14px 32px; border-radius:50px; font-size:15px; font-weight:600; cursor:pointer; transition:.25s; }
        .hbtn-secondary:hover { background:rgba(255,255,255,.1); border-color:#fff; }
        .hero-stats { display:inline-flex; align-items:center; gap:32px; background:rgba(255,255,255,.1); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,.2); padding:18px 40px; border-radius:60px; position:relative; z-index:1; }
        .hstat { text-align:center; }
        .hstat-num { display:block; font-size:26px; font-weight:800; }
        .hstat-label { font-size:12px; opacity:.75; }
        .hstat-div { width:1px; height:36px; background:rgba(255,255,255,.25); }

        /* ── SECTION COMMON ── */
        .sec-label { font-size:11px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; opacity:.6; margin-bottom:10px; text-align:center; }
        .sec-title { font-size:36px; font-weight:800; text-align:center; margin-bottom:12px; }
        .sec-sub { text-align:center; opacity:.75; font-size:15px; margin-bottom:50px; }

        /* ── FEATURES ── */
        .features-sec { padding:90px 60px; background:linear-gradient(180deg,#0b3e71,#0d47a1); }
        .feat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:24px; max-width:1100px; margin:0 auto; }
        .feat-card { background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); backdrop-filter:blur(10px); padding:32px; border-radius:20px; transition:.3s; }
        .feat-card:hover { background:rgba(255,255,255,.15); transform:translateY(-8px); box-shadow:0 20px 40px rgba(0,0,0,.2); }
        .feat-icon { font-size:36px; margin-bottom:14px; }
        .feat-card h3 { font-size:17px; font-weight:700; margin-bottom:8px; }
        .feat-card p { font-size:14px; opacity:.8; line-height:1.65; }

        /* ── HOW IT WORKS ── */
        .how-sec { padding:90px 60px; background:linear-gradient(135deg,#0d47a1,#1565c0); }
        .steps { display:flex; gap:30px; max-width:900px; margin:0 auto; justify-content:center; flex-wrap:wrap; }
        .step { flex:1; min-width:220px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2); border-radius:20px; padding:32px 24px; text-align:center; }
        .step:hover { background:rgba(255,255,255,.18); transform:translateY(-6px); }
        .step-num { font-size:42px; font-weight:800; opacity:.25; margin-bottom:12px; line-height:1; }
        .step h3 { font-size:18px; font-weight:700; margin-bottom:8px; }
        .step p { font-size:14px; opacity:.8; line-height:1.6; }

        /* ── ABOUT ── */
        .about-sec { padding:90px 60px; background:linear-gradient(135deg,#e8f2ff,#dbeeff); color:#0b3e71; }
        .about-sec .sec-label { color:#0b3e71; }
        .about-sec .sec-title { color:#0b3e71; }
        .about-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:24px; max-width:1100px; margin:0 auto; }
        .about-card { background:#fff; border-radius:20px; padding:32px; box-shadow:0 10px 30px rgba(11,62,113,.08); transition:.3s; }
        .about-card:hover { transform:translateY(-6px); box-shadow:0 20px 40px rgba(11,62,113,.14); }
        .about-icon { font-size:34px; margin-bottom:14px; }
        .about-card h3 { font-size:16px; font-weight:700; color:#0b3e71; margin-bottom:8px; }
        .about-card p { font-size:14px; color:#555; line-height:1.65; }

        /* ── CTA ── */
        .cta-sec { padding:90px 20px; text-align:center; background:linear-gradient(135deg,#0b3e71,#1a237e); }
        .cta-sec h2 { font-size:38px; font-weight:800; margin-bottom:14px; }
        .cta-sec p { font-size:16px; opacity:.8; margin-bottom:32px; }
        .cta-btn { background:#fff; color:#0b3e71; border:none; padding:16px 44px; border-radius:50px; font-size:16px; font-weight:700; cursor:pointer; box-shadow:0 10px 30px rgba(0,0,0,.2); transition:.25s; }
        .cta-btn:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(0,0,0,.3); }

        /* ── FOOTER ── */
        .footer { padding:40px 60px; background:#071e38; text-align:center; border-top:1px solid rgba(255,255,255,.08); }
        .footer-brand { display:flex; align-items:center; justify-content:center; gap:10px; font-size:18px; font-weight:700; margin-bottom:12px; }
        .footer-brand img { width:32px; height:32px; border-radius:50%; object-fit:cover; }
        .footer p { font-size:13px; opacity:.6; margin-top:6px; }

        /* ── SCROLL ANIMATIONS ── */
        .anim { opacity:0; transform:translateY(30px); transition:opacity .55s ease, transform .55s ease; }
        .anim.visible { opacity:1; transform:translateY(0); }

        /* ── RESPONSIVE ── */
        @media(max-width:768px){
          .nav { padding:14px 20px; }
          .hero { padding:130px 18px 70px; }
          .hero-h1 { font-size:34px; }
          .hero-stats { flex-direction:column; gap:16px; padding:20px 28px; }
          .hstat-div { width:60px; height:1px; }
          .features-sec, .how-sec, .about-sec { padding:60px 20px; }
          .sec-title { font-size:26px; }
        }
      `}</style>
    </>
  );
}

export default Welcome;
