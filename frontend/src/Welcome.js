import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import squadUpLogo from "./squaduplogo.png";
import axios from "axios";



function Welcome() {
  const navigate = useNavigate();
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const [stats, setStats] = useState({
  totalUsers: 0,
  totalGroups: 0,
});


  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

 useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/auth/stats"
      );

      console.log("API RESPONSE:", res.data); // 🔎 debug

      if (res.data && res.data.success) {
        setStats({
          totalUsers: res.data.totalUsers,
          totalGroups: res.data.totalGroups,
        });
      }

    } catch (err) {
      console.log("Stats not loaded", err);
    }
  };

  fetchStats();
}, []);


  return (
    <>
      <div className="landing-wrapper">

        {/* ================= NAVBAR ================= */}
        <nav className="navbar">
          <div className="nav-left">
            <img src={squadUpLogo} alt="logo" />
            <span>SquadUp</span>
          </div>

          <div className="nav-links">
            <button onClick={() => scrollToSection(featuresRef)}>Features</button>
            <button onClick={() => scrollToSection(aboutRef)}>About</button>

            <button onClick={() => navigate("/login")} className="nav-outline">
              Login
            </button>

            <button onClick={() => navigate("/register")} className="nav-primary">
              Register
            </button>
          </div>
        </nav>

        {/* ================= HERO ================= */}
        <section className="hero">
          <h1>SquadUp Collaboration System</h1>
          <p>
            Smart collaboration platform for students and academic teams.
            Secure. Fast. Professional.
          </p>

          <div className="hero-buttons">
            <button onClick={() => navigate("/register")} className="primary">
              Get Started →
            </button>

            <button onClick={() => scrollToSection(aboutRef)} className="secondary">
              Learn More
            </button>
          </div>
        </section>
 
 {/* ================= PLATFORM STATS ================= */}
<section className="platform-stats">
  <div className="stat-item">
    <h2>{stats.totalUsers}+</h2>
    <p>Registered Users</p>
  </div>

  <div className="stat-item">
    <h2>{stats.totalGroups}+</h2>
    <p>Groups Created</p>
  </div>
</section>

        {/* ================= FEATURES ================= */}
        <section className="features" ref={featuresRef}>
          <h2>Platform Features</h2>

          <div className="feature-grid">
            <div className="feature-card">
              <h3>🔐 Secure Authentication</h3>
              <p>OTP verification & JWT-based login system.</p>
            </div>

            <div className="feature-card">
              <h3>👥 Group Management</h3>
              <p>Create groups, manage members & collaborate securely.</p>
            </div>

            <div className="feature-card">
              <h3>📩 Real-time Updates</h3>
              <p>Instant email notifications & alerts.</p>
            </div>

            <div className="feature-card">
              <h3>📊 Professional Dashboard</h3>
              <p>Track all activities in one place.</p>
            </div>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section className="about" ref={aboutRef}>
          <h2>About SquadUp</h2>

          <div className="about-grid">
            <div className="about-box">
              <h3>Introduction</h3>
              <p>
                SquadUp is a modern collaboration and group management
                platform designed for students and academic teams.
              </p>
            </div>

            <div className="about-box">
              <h3>Problem Statement</h3>
              <p>
                Students face challenges managing group projects.
                SquadUp provides structured and secure collaboration.
              </p>
            </div>

            <div className="about-box">
              <h3>Our Mission</h3>
              <p>
                To provide a secure and professional collaboration
                platform tailored for students.
              </p>
            </div>

            <div className="about-box">
              <h3>Technology Stack</h3>
              <p>
                React.js • Node.js • Express.js • MongoDB • JWT • Nodemailer
              </p>
            </div>

            <div className="about-box">
              <h3>Security</h3>
              <p>
                OTP verification, JWT authentication and encrypted
                passwords ensure full data protection.
              </p>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="footer">
          <p>Developed By CE Student | CSPIT | CHARUSAT</p>
          <p>Contact: projectbyce123@gmail.com</p>
        </footer>
      </div>

      {/* ================= STYLES ================= */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        .landing-wrapper {
          background: linear-gradient(135deg, #0b3e71, #1f5fa3);
          color: white;
        }
          .platform-stats {
  display: flex;
  justify-content: center;
  gap: 80px;
  padding: 60px 20px;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(8px);
}

.stat-item {
  text-align: center;
}

.stat-item h2 {
  font-size: 40px;
  font-weight: 700;
}

.stat-item p {
  font-size: 15px;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .platform-stats {
    flex-direction: column;
    gap: 30px;
  }
}


        /* NAVBAR */
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 60px;
          background: rgba(0,0,0,0.25);
          position: sticky;
          top: 0;
          backdrop-filter: blur(10px);
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 22px;
          font-weight: 600;
        }

        .nav-left img {
          width: 42px;
          height: 42px;
          border-radius: 50%;
        }

        .nav-links {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .nav-links button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 15px;
        }

        .nav-outline {
          border: 1px solid white;
          padding: 8px 16px;
          border-radius: 8px;
        }

        .nav-primary {
          background: white;
          color: #0b3e71;
          padding: 8px 18px;
          border-radius: 8px;
          font-weight: 600;
        }

        /* HERO */
        .hero {
          text-align: center;
          padding: 120px 20px;
        }

        .hero h1 {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .hero p {
          font-size: 18px;
          margin-bottom: 40px;
          opacity: 0.9;
        }

        .hero-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .primary {
          background: white;
          color: #0b3e71;
          padding: 14px 28px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }

        .secondary {
          background: transparent;
          border: 2px solid white;
          color: white;
          padding: 14px 28px;
          border-radius: 8px;
          cursor: pointer;
        }

        /* FEATURES */
        .features {
          padding: 100px 60px;
          text-align: center;
        }

        .features h2 {
          font-size: 32px;
          margin-bottom: 60px;
          
        }
        
        .features h3{
         font-size: 19px;
          margin-bottom: 30px;
          color: #02284e;

        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          padding: 40px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.25);
          transition: 0.3s;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          background: rgba(255,255,255,0.22);
        }

        /* ABOUT */
        .about {
          padding: 100px 60px;
          background: linear-gradient(135deg, #e8f2ff, #d7e9ff);
          color: #0b3e71;
          text-align: center;
        }

        .about h2 {
          font-size: 32px;
          margin-bottom: 60px;
        }

       .about-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 30px;
  max-width: 1100px;
  margin: auto;
}

.about-box:nth-child(-n+3) {
  grid-column: span 2;
}

.about-box:nth-child(4) {
  grid-column: 2 / span 2;
}

.about-box:nth-child(5) {
  grid-column: 4 / span 2;
}


        .about-box {
          background: white;
          padding: 35px;
          border-radius: 18px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.08);
          transition: 0.3s;
        }

        .about-box:hover {
          transform: translateY(-8px);
        }

        .about-box h3 {
          margin-bottom: 15px;
          color: #0b3e71;
        }

        .about-box p {
          color: #444;
          line-height: 1.7;
        }

        .footer {
          padding: 40px;
          text-align: center;
          background: #0a2d50;
        }

        @media (max-width: 992px) {
          .about-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .navbar {
            flex-direction: column;
            gap: 15px;
          }

          .about-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

export default Welcome;
