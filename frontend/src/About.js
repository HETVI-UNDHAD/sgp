import squadUpLogo from "./squaduplogo.png";

function About() {
  return (
    <>
      <div className="about-wrapper">
        <div className="about-container">

          {/* HEADER */}
          <div className="about-header">
            <div className="logo-box">
              <img src={squadUpLogo} alt="SquadUp Logo" />
            </div>

            <div className="header-right">
              <h1>SquadUp</h1>
              <p className="tagline">Level Up Your SquadUp</p>
            </div>
          </div>

          {/* SECTION 1 */}
          <section>
            <h2>Introduction</h2>
            <p>
              SquadUp is a modern collaboration and group management platform
              designed specifically for students and small teams. The platform
              enables users to create groups, invite members securely, manage
              team activities, and collaborate efficiently in a digital
              environment.
            </p>
            <p>
              In today’s academic and professional world, teamwork plays a
              crucial role. SquadUp aims to simplify group communication and
              coordination by providing a secure, user-friendly, and scalable
              solution.
            </p>
          </section>

          {/* SECTION 2 */}
          <section>
            <h2>Problem Statement</h2>
            <p>
              Students often face difficulties while working in teams for
              academic projects, hackathons, or group assignments. Common
              problems include lack of structured communication, difficulty in
              managing members, insecure sharing of information, and confusion
              regarding roles and responsibilities.
            </p>
            <p>
              Existing platforms are either too complex or not specifically
              designed for student collaboration. SquadUp addresses these
              challenges by offering a simple yet powerful platform tailored to
              student needs.
            </p>
          </section>

          {/* SECTION 3 */}
          <section>
            <h2>Objectives of the Project</h2>
            <ul>
              <li>Secure authentication using OTP and JWT</li>
              <li>Easy group creation and management</li>
              <li>Secure member invitation system</li>
              <li>Simplified collaboration for academic teams</li>
              <li>Professional and responsive user interface</li>
            </ul>
          </section>

          {/* SECTION 4 */}
          <section>
            <h2>Features of SquadUp</h2>
            <ul>
              <li>User Registration with OTP Verification</li>
              <li>Secure Login & Forgot Password functionality</li>
              <li>Group Creation and Management</li>
              <li>Invite Members using Secure Tokens</li>
              <li>Dashboard for Managing Groups</li>
              <li>Modern and professional UI</li>
            </ul>
          </section>

          {/* SECTION 5 */}
          <section>
            <h2>Technology Stack</h2>
            <ul>
              <li><strong>Frontend:</strong> React.js</li>
              <li><strong>Backend:</strong> Node.js & Express.js</li>
              <li><strong>Database:</strong> MongoDB</li>
              <li><strong>Authentication:</strong> JWT & OTP Verification</li>
              <li><strong>Email Service:</strong> Nodemailer</li>
            </ul>
          </section>

          {/* SECTION 6 */}
          <section>
            <h2>Security & Authentication</h2>
            <p>
              Security is a core aspect of SquadUp. OTP-based verification,
              JWT authentication, and encrypted passwords ensure data safety and
              protect user privacy.
            </p>
          </section>

          {/* SECTION 7 */}
          <section>
            <h2>Future Enhancements</h2>
            <ul>
              <li>Role-based access control</li>
              <li>Real-time chat and notifications</li>
              <li>File sharing within groups</li>
              <li>Mobile application support</li>
            </ul>
          </section>

          {/* FOOTER */}
          <div className="about-footer">
            <p><strong>Developed By:</strong> CE Student</p>
            <p><strong>Institute:</strong> CSPIT</p>
            <p><strong>Department:</strong> Computer Engineering (CE)</p>
            <p><strong>University:</strong> CHARUSAT</p>
            <p className="email">
              <strong>Contact:</strong> projectbyce123@gmail.com
            </p>
          </div>

        </div>
      </div>

      {/* CSS */}
      <style>{`
  * {
    box-sizing: border-box;
    font-family: "Poppins", sans-serif;
  }

  /* PAGE BACKGROUND */
  .about-wrapper {
    min-height: 100vh;
    background: linear-gradient(180deg, #edf4fb, #e6eff8);
    padding: 60px 0; /* top & bottom spacing */
    display: flex;
    justify-content: center;
  }

  /* MAIN CONTAINER */
  .about-container {
    width: 90%;
    max-width: 850px;
    background: #f9fcff;
    border-radius: 20px;
    box-shadow: 0 20px 50px rgba(11, 62, 113, 0.15);
    overflow: hidden;
    padding-bottom: 40px;
  }

  /* HEADER STRIP */
  .about-header {
    background: #c0e4fa;
    padding: 35px 40px;
    display: flex;
    align-items: center;
    gap: 20px;
    border-bottom: 1px solid #cfe6fb;
  }

  .logo-box {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 8px 20px rgba(11, 62, 113, 0.25);
    flex-shrink: 0;
  }

  .logo-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .header-right h1 {
    font-size: 28px;
    color: #0b3e71;
    margin-bottom: 4px;
  }

  .tagline {
    font-size: 14px;
    color: #355f8c;
  }

  /* CONTENT AREA SPACING */
  section {
    background: #dceffb;
    margin: 25px 30px;
    padding: 25px 30px;
    border-radius: 14px;
    border: 1px solid #d0e6f5;
  }

  section h2 {
    color: #0b3e71;
    margin-bottom: 12px;
    font-size: 20px;
  }

  section p {
    line-height: 1.7;
    color: #24384d;
    margin-bottom: 10px;
    font-size: 14.8px;
  }

  section ul {
    padding-left: 20px;
  }

  section li {
    margin-bottom: 6px;
    font-size: 14.5px;
    color: #24384d;
  }

  /* FOOTER */
  .about-footer {
    background: #dceffb;
    margin: 30px 30px 0;
    padding: 22px;
    border-radius: 14px;
    border: 1px solid #d0e6f5;
    text-align: center;
    font-size: 14px;
  }

  .about-footer .email {
    margin-top: 8px;
    color: #0b3e71;
    font-weight: 500;
  }

  /* RESPONSIVE */
  @media (max-width: 600px) {
    .about-header {
      flex-direction: column;
      text-align: center;
    }

    section {
      margin: 20px;
      padding: 20px;
    }

    .about-footer {
      margin: 20px;
       text-transform: uppercase;
          text-align: center;
          font-size: 20px;
    }
  }
`}</style>


    </>
  );
}

export default About;
