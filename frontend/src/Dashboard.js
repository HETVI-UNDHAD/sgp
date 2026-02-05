import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    // 🔒 Not logged in
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    // ❌ user._id missing → data corrupted
    if (!parsedUser?._id) {
      console.error("User _id missing in localStorage");
      localStorage.clear();
      navigate("/login");
      return;
    }

    setUser(parsedUser);

    // ✅ Fetch groups
    const fetchGroups = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/group/user/${parsedUser._id}`
        );
        setGroups(res.data);
      } catch (err) {
        console.error("FETCH GROUP ERROR ❌", err);
        setError("Failed to load groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [navigate]);

  if (loading) {
    return <h2 className="loading">Loading...</h2>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Dashboard</h2>

        {/* ================= PROFILE ================= */}
        {user && (
          <div className="profile-box">
            <h3>Profile</h3>
            <p><b>Name:</b> {user.fullName}</p>
            <p><b>Email:</b> {user.email}</p>
          </div>
        )}

        {/* ================= GROUPS ================= */}
        <div className="group-box">
          <h3>My Groups</h3>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {groups.length === 0 && !error && (
            <p style={{ color: "#777" }}>No groups joined yet</p>
          )}

          {groups.map((g) => (
            <div key={g._id} className="group-item">
              <p><b>{g.name}</b></p>
              <p>Members: {g.memberCount}</p>

              <button
                className="view-btn"
                onClick={() => navigate(`/group/${g._id}`)}
              >
                View Group
              </button>
            </div>
          ))}
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="btn-group">
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
      </div>
    </div>
  );
}

export default Dashboard;
