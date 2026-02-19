import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  /* ================= FETCH GROUP ================= */
  const fetchGroup = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/group/${groupId}`
      );

      setGroup({
        ...res.data,
        members: res.data.members || [],
      });

    } catch (err) {
      console.error("GROUP FETCH ERROR ❌", err);
      alert("Failed to load group");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!groupId) return;
    fetchGroup();
  }, [groupId]);

  /* ================= REMOVE MEMBER ================= */
  const removeMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/group/${groupId}/remove/${memberId}`,
        { data: { adminId: user._id } }
      );

      alert("Member removed");
      fetchGroup();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Remove failed");
    }
  };

  /* ================= EXIT GROUP ================= */
  const exitGroup = async () => {
    if (!window.confirm("Leave this group?")) return;

    try {
      await axios.post(
        `http://localhost:5000/api/group/${groupId}/exit`,
        { userId: user._id }
      );

      alert("You left the group");
      navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data?.msg || "Exit failed");
    }
  };

  /* ================= STATES ================= */
  if (loading) return <h3 className="center">Loading group...</h3>;
  if (!group) return <h3 className="center">Group not found</h3>;

  const firstLetter = group.groupName?.charAt(0).toUpperCase();
  const isAdmin = user?._id === group.adminId;

  /* ================= UI ================= */
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

          {/* ⭐ ADMIN ADD MEMBER BUTTON */}
          {isAdmin && (
            <button
              className="add-btn"
              onClick={() => navigate(`/group/${groupId}/add-members`)}
            >
              ➕ Add Members
            </button>
          )}

          {/* TOGGLE MEMBERS */}
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="primary-btn"
          >
            {showMembers ? "Hide Members" : "Show Members"}
          </button>

          {/* MEMBER LIST */}
          {showMembers && (
            <div className="members-box">

              {group.members.length === 0 ? (
                <p>No members yet</p>
              ) : (
                <ul>
                  {group.members.map((member) => (
                    <li key={member.id} className="member-row">

                      {member.email}

                      {/* REMOVE BUTTON */}
                      {isAdmin && member.id !== group.adminId && (
                        <button
                          className="remove-btn"
                          onClick={() => removeMember(member.id)}
                        >
                          Remove
                        </button>
                      )}

                    </li>
                  ))}
                </ul>
              )}

            </div>
          )}

          {/* EXIT BUTTON */}
          {!isAdmin && (
            <button className="exit-btn" onClick={exitGroup}>
              Leave Group
            </button>
          )}

          {/* BACK */}
          <button
            className="secondary-btn"
            onClick={() => navigate("/dashboard")}
          >
            ⬅ Back to Dashboard
          </button>

        </div>
      </div>

      {/* CSS */}
      <style>{`
        *{box-sizing:border-box;font-family:Poppins,sans-serif}

        .details-wrapper{
          min-height:100vh;
          background:#f4f8ff;
          padding:50px;
        }

        .details-header{
          background:linear-gradient(135deg,#0b3e71,#1f5fa3);
          color:white;
          padding:30px;
          border-radius:16px;
          display:flex;
          align-items:center;
          gap:20px;
          margin-bottom:40px;
        }

        .group-avatar{
          width:80px;height:80px;border-radius:50%;
          background:white;color:#0b3e71;
          display:flex;align-items:center;justify-content:center;
          font-size:32px;font-weight:600;
        }

        .details-card{
          background:white;
          padding:30px;
          border-radius:16px;
          box-shadow:0 10px 25px rgba(0,0,0,0.05);
          max-width:600px;
          margin:auto;
        }

        .primary-btn{
          background:#0b3e71;color:white;
          padding:10px 18px;border-radius:8px;
          border:none;cursor:pointer;margin-bottom:15px;
        }

        .add-btn{
          background:#19a974;
          color:white;
          padding:10px 18px;
          border-radius:8px;
          border:none;
          cursor:pointer;
          margin-bottom:15px;
          width:100%;
          font-weight:600;
        }

        .members-box{
          background:#f4f8ff;
          padding:15px;border-radius:10px;
          margin-top:10px;max-height:200px;overflow-y:auto;
        }

        .member-row{
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:8px;
        }

        .remove-btn{
          background:#ff4d4f;
          color:white;
          border:none;
          padding:4px 10px;
          border-radius:6px;
          cursor:pointer;
        }

        .exit-btn{
          background:#ff7a45;
          color:white;
          border:none;
          padding:10px 18px;
          border-radius:8px;
          cursor:pointer;
          margin-top:15px;
          width:100%;
        }

        .secondary-btn{
          background:#ddd;
          color:#333;
          padding:10px 18px;
          border-radius:8px;
          border:none;
          cursor:pointer;
          margin-top:15px;
          width:100%;
        }

        .center{text-align:center;margin-top:60px}
      `}</style>
    </>
  );
}

export default GroupDetails;
