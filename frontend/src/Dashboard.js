import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [showGroups, setShowGroups] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    if (!parsedUser?._id) {
      localStorage.clear();
      navigate("/login");
      return;
    }

    setUser(parsedUser);
    setLoading(false);
  }, [navigate]);

  const loadGroups = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/group/user/${user._id}`
      );
      setGroups(res.data);
      setShowGroups(true);
    } catch (err) {
      alert("Failed to load groups ❌");
    }
  };

  if (loading) return <h2 className="loading">Loading...</h2>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h2 className="title">Dashboard</h2>

        {/* PROFILE */}
        <div className="profile-card">
          <h3>👤 Profile</h3>
          <p><b>Name:</b> {user.fullName}</p>
          <p><b>Email:</b> {user.email}</p>
        </div>

        {/* BUTTONS */}
        <div className="action-buttons">
          <button className="primary" onClick={loadGroups}>
            My Groups
          </button>

          <button onClick={() => navigate("/create-group")}>
            Create Group
          </button>

          <button
            className="logout"
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>

        {/* GROUP LIST */}
        {showGroups && (
          <div className="groups-section">
            <h3>📂 My Groups</h3>

            {groups.length === 0 && (
              <p className="empty">No groups joined yet</p>
            )}

            <div className="group-grid">
              {groups.map((g) => (
                <div key={g._id} className="group-card">
                  <h4>{g.name}</h4>
                  <p>Members: {g.memberCount}</p>

                  <button
                    className="view"
                    onClick={() => navigate(`/group/${g._id}`)}
                  >
                    View Group
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
