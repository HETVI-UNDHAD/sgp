import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "./config";
import "./theme.css";

function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);
  const navigate = useNavigate();

  const showPopup = (message, type = "success") => {
    setPopup({ message, type });
    setTimeout(() => setPopup(null), 3000);
  };

  const createGroup = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) { showPopup("User not logged in", "error"); navigate("/login"); return; }
    if (!groupName.trim()) { showPopup("Group name is required", "error"); return; }
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/group/create`, { groupName, description, adminId: user._id });
      showPopup("Group Created Successfully 🎉");
      setTimeout(() => navigate(`/add-members/${res.data._id}`), 1000);
    } catch (err) {
      showPopup(err.response?.data?.msg || "Error creating group", "error");
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="cg-wrap">
        <div className="cg-card glass">
          <div className="cg-icon">👥</div>
          <h2>Create New Group</h2>
          <p className="cg-sub">Start collaborating by creating your own squad.</p>

          <div className="cg-field">
            <label>Group Name</label>
            <input className="t-input" type="text" placeholder="Enter group name" value={groupName} maxLength={40} onChange={e => setGroupName(e.target.value)} />
            <small>{groupName.length}/40</small>
          </div>

          <div className="cg-field">
            <label>Description</label>
            <textarea className="t-input" placeholder="Write a short description..." value={description} maxLength={120} onChange={e => setDescription(e.target.value)} />
            <small>{description.length}/120</small>
          </div>

          <div className="cg-btns">
            <button className="t-btn-outline cg-cancel" onClick={() => navigate("/dashboard")}>Cancel</button>
            <button className="t-btn cg-create" onClick={createGroup} disabled={loading}>
              {loading ? "Creating..." : "Create & Continue →"}
            </button>
          </div>
        </div>
      </div>

      {popup && <div className={`t-toast ${popup.type}`}>{popup.message}</div>}

      <style>{`
        .cg-wrap { min-height:100vh; display:flex; justify-content:center; align-items:center; background:transparent; padding:20px; }
        .cg-card { width:100%; max-width:500px; padding:44px; animation:fadeUp .4s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .cg-icon { font-size:40px; margin-bottom:12px; }
        .cg-card h2 { font-size:24px; font-weight:700; margin-bottom:6px; }
        .cg-sub { color:var(--text-muted); font-size:14px; margin-bottom:32px; }
        .cg-field { margin-bottom:22px; }
        .cg-field label { display:block; font-size:13px; font-weight:600; color:var(--accent2); margin-bottom:8px; letter-spacing:.5px; }
        .cg-field textarea { resize:none; height:90px; }
        .cg-field small { font-size:12px; color:var(--text-muted); margin-top:6px; display:block; }
        .cg-btns { display:flex; gap:12px; margin-top:8px; }
        .cg-cancel { flex:1; padding:13px; }
        .cg-create { flex:2; }
      `}</style>
    </>
  );
}
export default CreateGroup;
