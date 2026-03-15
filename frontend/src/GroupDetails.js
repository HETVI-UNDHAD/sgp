import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "./config";

function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedNewAdmin, setSelectedNewAdmin] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  /* ================= FETCH GROUP ================= */
  const fetchGroup = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/group/${groupId}`
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
        `${API_URL}/api/group/${groupId}/remove/${memberId}`,
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
    setLeaving(true);
    try {
      await axios.post(`${API_URL}/api/group/${groupId}/exit`, { userId: user._id });
      setShowLeaveModal(false);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Exit failed");
    } finally {
      setLeaving(false);
    }
  };

  /* ================= ADMIN LEAVE (transfer then exit) ================= */
  const adminLeave = async () => {
    if (!selectedNewAdmin) return alert("Please select a new admin");
    setTransferring(true);
    try {
      await axios.post(`${API_URL}/api/group/${groupId}/transfer-admin`, {
        adminId: user._id,
        newAdminId: selectedNewAdmin,
      });
      await axios.post(`${API_URL}/api/group/${groupId}/exit`, { userId: user._id });
      alert("Admin transferred and you have left the group");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to transfer admin");
    } finally {
      setTransferring(false);
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

          <button
            onClick={() => navigate(`/chat/${groupId}`)}
            className="primary-btn"
            style={{ marginLeft: "10px" }}
          >
            💬 Open Chat
          </button>

          <button
            onClick={() => navigate(`/video-call/${groupId}`)}
            className="primary-btn"
            style={{ marginLeft: "10px", background: "#34a853" }}
          >
            📹 Video Call
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

                      {member.fullName || member.email}

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
            <button className="exit-btn" onClick={() => setShowLeaveModal(true)}>
              🚪 Leave Group
            </button>
          )}

          {/* LEAVE CONFIRM MODAL */}
          {showLeaveModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3>Leave Group?</h3>
                <p>Are you sure you want to leave <strong>{group.groupName}</strong>? You won't be able to see messages unless re-invited.</p>
                <div className="modal-actions">
                  <button
                    className="confirm-btn"
                    style={{ background: "#ff7a45" }}
                    onClick={exitGroup}
                    disabled={leaving}
                  >
                    {leaving ? "Leaving..." : "Yes, Leave"}
                  </button>
                  <button className="cancel-btn" onClick={() => setShowLeaveModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN LEAVE BUTTON */}
          {isAdmin && (
            <button className="exit-btn" onClick={() => { setSelectedNewAdmin(""); setShowTransferModal(true); }}>
              🚪 Leave Group
            </button>
          )}

          {/* TRANSFER MODAL */}
          {showTransferModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3>Select New Admin</h3>
                <p>You must assign a new admin before leaving.</p>
                <select
                  value={selectedNewAdmin}
                  onChange={e => setSelectedNewAdmin(e.target.value)}
                  className="admin-select"
                >
                  <option value="">-- Choose a member --</option>
                  {group.members
                    .filter(m => m.id !== user._id)
                    .map(m => (
                      <option key={m.id} value={m.id}>{m.fullName || m.email}</option>
                    ))}
                </select>
                <div className="modal-actions">
                  <button
                    className="confirm-btn"
                    onClick={adminLeave}
                    disabled={transferring || !selectedNewAdmin}
                  >
                    {transferring ? "Processing..." : "Confirm & Leave"}
                  </button>
                  <button className="cancel-btn" onClick={() => setShowTransferModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
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
          position:static;
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

        .modal-overlay{
          position:fixed;inset:0;background:rgba(0,0,0,0.5);
          display:flex;align-items:center;justify-content:center;z-index:1000;
        }
        .modal-box{
          background:white;padding:30px;border-radius:16px;
          width:90%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,0.2);
        }
        .modal-box h3{margin-bottom:8px;color:#0b3e71;}
        .modal-box p{font-size:13px;color:#666;margin-bottom:16px;}
        .admin-select{
          width:100%;padding:10px;border-radius:8px;
          border:1.5px solid #dce8ff;font-size:14px;margin-bottom:16px;
          outline:none;
        }
        .modal-actions{display:flex;gap:10px;}
        .confirm-btn{
          flex:1;background:#0b3e71;color:white;
          border:none;padding:10px;border-radius:8px;
          cursor:pointer;font-weight:600;
        }
        .confirm-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .cancel-btn{
          flex:1;background:#ddd;color:#333;
          border:none;padding:10px;border-radius:8px;cursor:pointer;
        }
      `}</style>
    </>
  );
}

export default GroupDetails;
