import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import squadUpLogo from "./squaduplogo.png";
import "./theme.css";

function Profile() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [educationType, setEducationType] = useState("college");
  const [form, setForm] = useState({
    fullName: storedUser?.fullName || "", email: storedUser?.email || "",
    phone: "", schoolName: "", standard: "", stream: "",
    collegeName: "", semester: "", branch: "", enrollment: "",
    bio: "", skills: "", linkedin: "", github: "",
  });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) { setError("Please fill all required fields."); return; }
    if (educationType === "college" && (!form.collegeName || !form.semester || !form.branch || !form.enrollment)) { setError("Please fill all college details."); return; }
    if (educationType === "school" && (!form.schoolName || !form.standard || !form.stream)) { setError("Please fill all school details."); return; }
    localStorage.setItem("user", JSON.stringify({ ...storedUser, ...form, educationType }));
    setError("");
    setShowModal(true);
  };

  const firstLetter = form.fullName?.charAt(0).toUpperCase();

  return (
    <>
      <div className="pf-wrap">

        {/* NAVBAR */}
        <nav className="pf-nav">
          <div className="pf-nav-brand">
            <img src={squadUpLogo} alt="logo" />
            <span>SquadUp</span>
          </div>
          <button className="t-btn-outline pf-back" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
        </nav>

        <div className="pf-body">
          <div className="pf-card glass">

            {/* HEADER */}
            <div className="pf-header">
              <div className="pf-avatar">{firstLetter}</div>
              <div>
                <h2>Edit Profile</h2>
                <p>{form.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="pf-section">
                <p className="pf-sec-label">BASIC INFO</p>
                <div className="pf-grid2">
                  <input className="t-input" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} />
                  <input className="t-input" name="email" value={form.email} disabled style={{ opacity: 0.5 }} />
                  <input className="t-input" name="phone" placeholder="Phone Number" onChange={handleChange} />
                  <select className="t-input" value={educationType} onChange={(e) => setEducationType(e.target.value)}>
                    <option value="college">College</option>
                    <option value="school">School</option>
                  </select>
                </div>
              </div>

              {educationType === "school" && (
                <div className="pf-section">
                  <p className="pf-sec-label">SCHOOL DETAILS</p>
                  <input className="t-input" name="schoolName" placeholder="School Name" onChange={handleChange} style={{ marginBottom: 12 }} />
                  <div className="pf-grid2">
                    <select className="t-input" name="standard" onChange={handleChange}>
                      <option value="">Select Standard</option>
                      {[...Array(12)].map((_, i) => <option key={i}>{i + 1}</option>)}
                    </select>
                    <select className="t-input" name="stream" onChange={handleChange}>
                      <option value="">Select Stream</option>
                      <option>Science</option><option>Commerce</option><option>Arts</option>
                    </select>
                  </div>
                </div>
              )}

              {educationType === "college" && (
                <div className="pf-section">
                  <p className="pf-sec-label">COLLEGE DETAILS</p>
                  <input className="t-input" name="collegeName" placeholder="College Name" onChange={handleChange} style={{ marginBottom: 12 }} />
                  <div className="pf-grid2">
                    <input className="t-input" name="semester" placeholder="Current Semester" onChange={handleChange} />
                    <input className="t-input" name="branch" placeholder="Branch / Course" onChange={handleChange} />
                  </div>
                  <input className="t-input" name="enrollment" placeholder="Enrollment Number" onChange={handleChange} style={{ marginTop: 12 }} />
                </div>
              )}

              <div className="pf-section">
                <p className="pf-sec-label">ADDITIONAL INFO</p>
                <textarea className="t-input" name="bio" placeholder="Short Bio" onChange={handleChange} style={{ minHeight: 80, resize: "none", marginBottom: 12 }} />
                <input className="t-input" name="skills" placeholder="Skills (comma separated)" onChange={handleChange} style={{ marginBottom: 12 }} />
                <div className="pf-grid2">
                  <input className="t-input" name="linkedin" placeholder="LinkedIn URL" onChange={handleChange} />
                  <input className="t-input" name="github" placeholder="GitHub URL" onChange={handleChange} />
                </div>
              </div>

              {error && <div className="pf-error">{error}</div>}

              <button type="submit" className="t-btn" style={{ marginTop: 8 }}>Save Profile</button>
            </form>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="pf-modal-overlay">
          <div className="pf-modal glass">
            <div className="pf-modal-icon">🎉</div>
            <h3>Profile Updated!</h3>
            <p>Your profile has been saved successfully.</p>
            <button className="t-btn" onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
          </div>
        </div>
      )}

      <style>{`
        .pf-wrap { min-height: 100vh; background: transparent; }
        .pf-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 40px;
          background: rgba(13,13,26,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--card-border);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .pf-nav-brand { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; }
        .pf-nav-brand img { width: 34px; height: 34px; border-radius: 50%; }
        .pf-back { width: auto; padding: 9px 18px; }

        .pf-body { max-width: 780px; margin: 40px auto; padding: 0 20px 60px; }
        .pf-card { padding: 40px; }

        .pf-header { display: flex; align-items: center; gap: 20px; margin-bottom: 36px; }
        .pf-avatar {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: white;
          font-size: 28px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 30px var(--accent-glow);
        }
        .pf-header h2 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
        .pf-header p { font-size: 13px; color: var(--text-muted); }

        .pf-section { margin-bottom: 28px; }
        .pf-sec-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: var(--accent2);
          margin-bottom: 14px;
        }
        .pf-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .t-input { margin-bottom: 0; }

        .pf-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          color: var(--error);
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .pf-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          backdrop-filter: blur(4px);
        }
        .pf-modal {
          padding: 40px;
          text-align: center;
          width: 340px;
        }
        .pf-modal-icon { font-size: 48px; margin-bottom: 16px; }
        .pf-modal h3 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .pf-modal p { color: var(--text-muted); font-size: 14px; margin-bottom: 24px; }

        select.t-input option { background: #1a1a2e; color: var(--text); }

        @media (max-width: 600px) {
          .pf-grid2 { grid-template-columns: 1fr; }
          .pf-card { padding: 24px; }
        }
      `}</style>
    </>
  );
}

export default Profile;
