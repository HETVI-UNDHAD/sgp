import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const fetchGroup = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/group/${groupId}`
        );
        setGroup(res.data);
      } catch (err) {
        console.error("GROUP FETCH ERROR ❌", err);
        alert("Failed to load group");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, navigate]);

  if (loading) return <h3 className="center">Loading group...</h3>;
  if (!group) return <h3 className="center">Group not found</h3>;

  const firstLetter = group.groupName?.charAt(0).toUpperCase();

  return (
    <>
      <div className="details-wrapper">

        {/* HEADER */}
        <div className="details-header">
          <div className="group-avatar">{firstLetter}</div>
          <div>
            <h2>{group.groupName}</h2>
            <p>Manage your group information</p>
          </div>
        </div>

        {/* CARD */}
        <div className="details-card">

          <div className="info-section">
            <p><strong>Admin:</strong> {group.adminEmail}</p>
            <p><strong>Total Members:</strong> {group.memberCount}</p>
          </div>

          <button
            onClick={() => setShowMembers(!showMembers)}
            className="primary-btn"
          >
            {showMembers ? "Hide Members" : "Show Members"}
          </button>

          {showMembers && (
            <div className="members-box">
              {group.memberEmails.length === 0 ? (
                <p>No members yet</p>
              ) : (
                <ul>
                  {group.memberEmails.map((email, index) => (
                    <li key={index}>{email}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button
            className="secondary-btn"
            onClick={() => navigate("/dashboard")}
          >
            ⬅ Back to Dashboard
          </button>

        </div>
      </div>

      {/* THEME CSS */}
      <style>{`
        * {
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        .details-wrapper {
          min-height: 100vh;
          background: #f4f8ff;
          padding: 50px;
        }

        .details-header {
          background: linear-gradient(135deg,#0b3e71,#1f5fa3);
          color: white;
          padding: 30px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
        }

        .group-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: white;
          color: #0b3e71;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 600;
        }

        .details-card {
          background: white;
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          max-width: 600px;
          margin: auto;
          transition: 0.3s ease;
        }

        .details-card:hover {
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }

        .info-section {
          margin-bottom: 20px;
          font-size: 15px;
        }

        .primary-btn {
          background: #0b3e71;
          color: white;
          padding: 10px 18px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          margin-bottom: 15px;
          transition: 0.3s;
        }

        .primary-btn:hover {
          background: #145da0;
        }

        .secondary-btn {
          background: #ddd;
          color: #333;
          padding: 10px 18px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          margin-top: 10px;
        }

        .members-box {
          background: #f4f8ff;
          padding: 15px;
          border-radius: 10px;
          margin-top: 10px;
          max-height: 200px;
          overflow-y: auto;
        }

        .members-box ul {
          padding-left: 20px;
        }

        .members-box li {
          margin-bottom: 6px;
        }

        .center {
          text-align: center;
          margin-top: 60px;
        }

        @media(max-width:768px){
          .details-header{
            flex-direction: column;
            text-align: center;
          }
        }

      `}</style>
    </>
  );
}

export default GroupDetails;
