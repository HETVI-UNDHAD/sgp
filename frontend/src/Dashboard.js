import React, { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  if (!user) return <h2 className="loading">Loading...</h2>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Dashboard</h2>

        <div className="profile-box">
          <h3>Profile</h3>
          <p><b>Name:</b> {user.fullName}</p>
          <p><b>Email:</b> {user.email}</p>
        </div>

        <div className="btn-group">
          <button onClick={() => window.location.href = "/create-group"}>
            Create Group
          </button>

          <button onClick={() => window.location.href = "/my-groups"}>
            My Groups
          </button>

          <button
            className="logout"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
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
