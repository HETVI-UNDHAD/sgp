import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import squadUpLogo from "./squaduplogo.png";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setLoading(false);

    loadGroups(parsedUser._id);
  }, [navigate]);

  const loadGroups = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/group/user/${userId}`
      );
      setGroups(res.data);
    } catch (err) {
      console.log("No groups found");
    }
  };

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  if (!user) return null;

  const firstLetter = user.fullName?.charAt(0).toUpperCase();

  // Groups Created Count (admin)
  const groupsCreated = groups.filter(
    (g) => g.adminEmail === user.email
  ).length;

  return (
    <>
      <div className="dashboard-wrapper">

        {/* NAVBAR */}
        <nav className="navbar">
          <div className="nav-left">
            <img src={squadUpLogo} alt="logo" />
            <span>SquadUp</span>
          </div>

          <div className="nav-right">
            <div
              className="profile-circle"
              onClick={() => navigate("/profile")}
            >
              {firstLetter}
            </div>

            <button
              className="logout-btn"
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </nav>

        {/* CONTENT */}
        <div className="dashboard-content">

          {/* WELCOME */}
          <div className="welcome-card">
            <h2>Welcome back, {user.fullName} 👋</h2>
            <p>Manage your groups and profile from here.</p>
          </div>

          {/* PROFILE SUMMARY */}
          <div className="profile-summary">
            <div className="profile-left">
              <div className="big-avatar">{firstLetter}</div>

              <div>
                <h3>{user.fullName}</h3>
                <p>{user.email}</p>
                {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
              </div>
            </div>

            <div className="profile-right">
              {user.educationType && (
                <p><strong>Education:</strong> {user.educationType}</p>
              )}

              {user.educationType === "college" && (
                <>
                  <p><strong>College:</strong> {user.collegeName}</p>
                  <p><strong>Branch:</strong> {user.branch}</p>
                  <p><strong>Semester:</strong> {user.semester}</p>
                </>
              )}

              {user.educationType === "school" && (
                <>
                  <p><strong>School:</strong> {user.schoolName}</p>
                  <p><strong>Standard:</strong> {user.standard}</p>
                  <p><strong>Stream:</strong> {user.stream}</p>
                </>
              )}

              {user.skills && (
                <p><strong>Skills:</strong> {user.skills}</p>
              )}
            </div>
          </div>

          {/* STATS */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{groups.length}</h3>
              <p>Total Groups</p>
            </div>

            <div className="stat-card">
              <h3>{groupsCreated}</h3>
              <p>Groups Created</p>
            </div>
          </div>

          {/* CREATE GROUP SECTION */}
          <div className="create-group-section">
            <div className="create-left">
              <h3>Create a New Group</h3>
              <p>
                Start a new squad for projects, studies, hackathons, or
                collaboration. Invite members and manage everything in one place.
              </p>
            </div>

            <div className="create-right">
              <button onClick={() => navigate("/create-group")}>
                + Create Group
              </button>
            </div>
          </div>

          {/* GROUPS */}
          <div className="groups-section">
            <h3>My Groups</h3>

            {groups.length === 0 ? (
              <p className="empty">You haven't joined any groups yet.</p>
            ) : (
              <div className="group-grid">
                {groups.map((g) => (
                  <div key={g._id} className="group-card">
                    <div className="group-avatar">
                      {g.name.charAt(0).toUpperCase()}
                    </div>
                    <h4>{g.name}</h4>
                    <p>Members: {g.memberCount}</p>

                    <div className="group-card-buttons">
                      <button
                        onClick={() => navigate(`/group/${g._id}`)}
                        className="btn-secondary"
                      >
                        View Group
                      </button>
                      <button
                        onClick={() => navigate(`/messages/${g._id}`)}
                        className="btn-primary"
                        title="Open chat"
                      >
                        💬 Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CSS */}
      <style>{`
        * {
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        .dashboard-wrapper {
          min-height: 100vh;
          background: #f4f8ff;
        }

        .navbar {
          background: linear-gradient(90deg,#0b3e71,#145da0);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 50px;
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
          height: 40px;
          border-radius: 50%;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .profile-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          color: #0b3e71;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          cursor: pointer;
        }

        .logout-btn {
          background: white;
          color: #0b3e71;
          border: none;
          padding: 8px 15px;
          border-radius: 8px;
          cursor: pointer;
        }

        .dashboard-content {
          padding: 50px;
          max-width: 1200px;
          margin: auto;
        }

        .welcome-card {
          background: linear-gradient(135deg,#0b3e71,#1f5fa3);
          color: white;
          padding: 30px;
          border-radius: 16px;
          margin-bottom: 30px;
        }

        .profile-summary {
          background: white;
          padding: 30px;
          border-radius: 16px;
          margin-bottom: 40px;
          display: flex;
          justify-content: space-between;
          gap: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }

        .profile-left {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .big-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: #0b3e71;
          color: white;
          font-size: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(200px,1fr));
          gap: 25px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          padding: 25px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }

        .stat-card h3 {
          font-size: 28px;
          color: #0b3e71;
        }

        .create-group-section {
          background: white;
          padding: 30px;
          border-radius: 16px;
          margin-bottom: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }

        .create-left h3 {
          color: #0b3e71;
          margin-bottom: 10px;
        }

        .create-left p {
          color: #555;
          max-width: 500px;
          font-size: 14px;
        }

        .create-right button {
          padding: 12px 20px;
          border-radius: 8px;
          border: none;
          background: #0b3e71;
          color: white;
          cursor: pointer;
          font-weight: 500;
        }

        .group-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
          gap: 25px;
        }

        .group-card {
          background: white;
          padding: 20px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }

        .group-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #0b3e71;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin: auto;
          margin-bottom: 10px;
        }

        .group-card button {
          margin-top: 10px;
          padding: 8px 14px;
          border-radius: 6px;
          border: none;
          background: #0b3e71;
          color: white;
          cursor: pointer;
        }

        .group-card-buttons {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .group-card-buttons button {
          flex: 1;
          margin-top: 0;
          padding: 10px 12px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .group-card-buttons .btn-primary {
          background: linear-gradient(135deg, #34a853, #1f8e48);
        }

        .group-card-buttons .btn-primary:hover {
          background: linear-gradient(135deg, #3da85f, #227d4f);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(52, 168, 83, 0.3);
        }

        .group-card-buttons .btn-secondary {
          background: #0b3e71;
        }

        .group-card-buttons .btn-secondary:hover {
          background: #0a3060;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(11, 62, 113, 0.3);
        }

        @media(max-width:900px){
          .profile-summary,
          .create-group-section{
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}

export default Dashboard;
