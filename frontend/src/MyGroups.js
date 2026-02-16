import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MyGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || !user._id) {
      navigate("/login");
      return;
    }

    const fetchGroups = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/group/user/${user._id}`
        );
        setGroups(res.data);
      } catch (err) {
        console.error("FETCH GROUP ERROR ❌", err);
        alert("Failed to load groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user?._id, navigate]);

  if (loading) {
    return <h3 style={{ textAlign: "center" }}>Loading groups...</h3>;
  }

  return (
    <>
      <div className="groups-wrapper">

        {/* HEADER */}
        <div className="groups-header">
          <h2>My Groups</h2>
          <p>View and manage your joined groups</p>
        </div>

        {groups.length === 0 && (
          <p className="empty-text">No groups joined yet</p>
        )}

        <div className="groups-grid">
          {groups.map((g) => (
            <div key={g._id} className="group-card">

              <div className="group-avatar">
                {g.name.charAt(0).toUpperCase()}
              </div>

              <h3>{g.name}</h3>

              <p><strong>Admin:</strong> {g.adminEmail}</p>
              <p><strong>Total Members:</strong> {g.memberCount}</p>

              <details>
                <summary>Show member emails</summary>
                <ul>
                  {g.memberEmails.map((email, i) => (
                    <li key={i}>{email}</li>
                  ))}
                </ul>
              </details>

              <button
                onClick={() => navigate(`/group/${g._id}`)}
              >
                Open Group
              </button>

            </div>
          ))}
        </div>

      </div>

      {/* THEME CSS */}
      <style>{`
        * {
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        .groups-wrapper {
          padding: 50px;
          background: #f4f8ff;
          min-height: 100vh;
        }

        .groups-header {
          background: linear-gradient(135deg,#0b3e71,#1f5fa3);
          color: white;
          padding: 30px;
          border-radius: 16px;
          margin-bottom: 40px;
        }

        .groups-header h2 {
          margin-bottom: 5px;
        }

        .empty-text {
          color: #777;
          margin-top: 20px;
        }

        .groups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(260px,1fr));
          gap: 25px;
        }

        .group-card {
          background: white;
          padding: 25px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          text-align: center;
        }

        .group-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }

        .group-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: #0b3e71;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin: auto;
          margin-bottom: 15px;
        }

        .group-card h3 {
          margin-bottom: 10px;
          color: #0b3e71;
        }

        details {
          margin-top: 10px;
          text-align: left;
        }

        details summary {
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 5px;
        }

        details ul {
          padding-left: 20px;
          margin-top: 5px;
        }

        .group-card button {
          margin-top: 15px;
          padding: 10px 18px;
          border-radius: 8px;
          border: none;
          background: #0b3e71;
          color: white;
          cursor: pointer;
          transition: 0.3s;
        }

        .group-card button:hover {
          background: #145da0;
        }
      `}</style>
    </>
  );
}

export default MyGroups;
