import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import squadUpLogo from "./squaduplogo.png";

function Profile() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [educationType, setEducationType] = useState("college");

  const [form, setForm] = useState({
    fullName: storedUser?.fullName || "",
    email: storedUser?.email || "",
    
    schoolName: "",
    phone: "",
    standard: "",
    stream: "",
    collegeName: "",
    semester: "",
    branch: "",
    enrollment: "",
    bio: "",
    skills: "",
    linkedin: "",
    github: "",
    
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  


  const [showModal, setShowModal] = useState(false);
const [error, setError] = useState("");

const handleSubmit = (e) => {
  e.preventDefault();

  if (!form.fullName || !form.phone) {
    setError("Please fill all required fields.");
    return;
  }

  if (educationType === "college") {
    if (!form.collegeName || !form.semester || !form.branch || !form.enrollment) {
      setError("Please fill all college details.");
      return;
    }
  }

  if (educationType === "school") {
    if (!form.schoolName || !form.standard || !form.stream) {
      setError("Please fill all school details.");
      return;
    }
  }

  const updatedUser = {
    ...storedUser,
    ...form,
    educationType,
  };

 

  setError("");
  setShowModal(true);
};



  const firstLetter = form.fullName?.charAt(0).toUpperCase();

  return (
    <>
      <div className="profile-wrapper">

        {/* NAVBAR */}
        <nav className="navbar">
          <div className="nav-left">
            <img src={squadUpLogo} alt="logo" />
            <span>SquadUp</span>
          </div>

          <button
  className="back-btn"
  onClick={() => navigate("/dashboard")}
>
  ← Back to Dashboard
</button>

        </nav>

        {/* PROFILE CARD */}
        <div className="profile-card">

          {/* PROFILE HEADER */}
          <div className="profile-header">

            <div className="profile-photo-wrapper">
              {form.photo ? (
  <img
    src={form.photo}
    alt="Profile"
    className="profile-photo"
  />
) : (

                <div className="profile-placeholder">
                  {firstLetter}
                </div>
              )}
            </div>
            

            <div className="photo-actions">
              <h2>Edit Profile</h2>
              
            </div>

          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>

            <div className="grid-2">
              <input
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
              />

              <input
                name="email"
                value={form.email}
                disabled
              />
            </div>

            <div className="grid-2">
              <input
                name="phone"
                placeholder="Phone Number"
                onChange={handleChange}
              />

              <select
                value={educationType}
                onChange={(e) => setEducationType(e.target.value)}
              >
                <option value="college">College</option>
                <option value="school">School</option>
              </select>
            </div>

            {/* SCHOOL */}
            {educationType === "school" && (
              <div className="section-box">
                <h3>School Details</h3>

                <input
                  name="schoolName"
                  placeholder="School Name"
                  onChange={handleChange}
                />

                <div className="grid-2">
                  <select name="standard" onChange={handleChange}>
                    <option value="">Select Standard</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i}>{i + 1}</option>
                    ))}
                  </select>

                  <select name="stream" onChange={handleChange}>
                    <option value="">Select Stream</option>
                    <option>Science</option>
                    <option>Commerce</option>
                    <option>Arts</option>
                  </select>
                </div>
              </div>
            )}

            {/* COLLEGE */}
            {educationType === "college" && (
              <div className="section-box">
                <h3>College Details</h3>

                <input
                  name="collegeName"
                  placeholder="College Name"
                  onChange={handleChange}
                />

                <div className="grid-2">
                  <input
                    name="semester"
                    placeholder="Current Semester"
                    onChange={handleChange}
                  />

                  <input
                    name="branch"
                    placeholder="Branch / Course"
                    onChange={handleChange}
                  />
                </div>

                <input
                  name="enrollment"
                  placeholder="Enrollment Number"
                  onChange={handleChange}
                />
              </div>
            )}

            {/* EXTRA */}
            <div className="section-box">
              <h3>Additional Information</h3>

              <textarea
                name="bio"
                placeholder="Short Bio"
                onChange={handleChange}
              />

              <input
                name="skills"
                placeholder="Skills (comma separated)"
                onChange={handleChange}
              />

              <div className="grid-2">
                <input
                  name="linkedin"
                  placeholder="LinkedIn URL"
                  onChange={handleChange}
                />

                <input
                  name="github"
                  placeholder="GitHub URL"
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="save-btn">
              Save Profile
            </button>
            
            {error && <div className="error-box">{error}</div>}

{showModal && (
  <div className="modal-overlay">
    <div className="modal-box">
      <h3>Profile Updated Successfully 🎉</h3>
      <button onClick={() => navigate("/dashboard")}>
        Go to Dashboard
      </button>
    </div>
  </div>
)}

          </form>

        </div>
      </div>

      {/* CSS */}
      <style>{`
        * {
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        .profile-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #0b3e71, #145da0);
          padding: 40px;
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          margin-bottom: 40px;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 600;
        }

        .nav-left img {
          width: 40px;
          border-radius: 50%;
        }

        .profile-card {
          max-width: 850px;
          margin: auto;
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        /* PROFILE HEADER */
        .profile-header {
          display: flex;
          align-items: center;
          gap: 30px;
          margin-bottom: 35px;
        }
          /* BACK BUTTON */
.back-btn {
  background: white;
  color: #0b3e71;
  padding: 10px 20px;
  border-radius: 8px;
  border: 2px solid white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #e6f0ff;
  border: 2px solid #e6f0ff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.back-btn:active {
  transform: scale(0.98);
}


        .profile-photo {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 6px solid #0b3e71;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .profile-placeholder {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0b3e71, #1f5fa3);
          color: white;
          font-size: 55px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .photo-actions h2 {
          margin-bottom: 12px;
          color: #0b3e71;
        }

        

        input, select, textarea {
          width: 100%;
          padding: 12px;
          margin-bottom: 15px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }

        textarea {
          min-height: 90px;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .section-box {
          background: #f4f8ff;
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 20px;
        }

        .section-box h3 {
          margin-bottom: 15px;
          color: #0b3e71;
        }

        .save-btn {
          background: #0b3e71;
          color: white;
          padding: 14px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          width: 100%;
          font-size: 16px;
        }

        @media(max-width:768px){
          .grid-2{
            grid-template-columns: 1fr;
          }

          .profile-header{
            flex-direction: column;
            text-align: center;
          }
        }
          .error-box {
  background: #ffe6e6;
  color: #cc0000;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-box {
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  width: 320px;
}

.modal-box h3 {
  margin-bottom: 20px;
  color: #0b3e71;
}

.modal-box button {
  background: #0b3e71;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

      `}</style>
    </>
  );
}

export default Profile;
