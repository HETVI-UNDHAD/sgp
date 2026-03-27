import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import squadUpLogo from "./squaduplogo.png";
import { API_URL } from "./config";
import "./theme.css";

function AddMembers() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);

  const showPopup = (message, type = "success") => {
    setPopup({ message, type });
    setTimeout(() => setPopup(null), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const email = emailInput.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showPopup("Invalid email format", "error"); return; }
      if (emails.includes(email)) { showPopup("Email already added", "error"); return; }
      setEmails([...emails, email]);
      setEmailInput("");
    }
  };

  const removeEmail = (remove) => setEmails(emails.filter(e => e !== remove));

  const sendInvite = async () => {
    if (emails.length === 0) { showPopup("Please add at least one email", "error"); return; }
    try {
      setLoading(true);
      for (let email of emails) {
        await axios.post(`${API_URL}/api/group/invite`, { email, groupId });
      }
      showPopup("Invitations sent successfully 🎉");
      setEmails([]);
      setTimeout(() => navigate(`/messages/${groupId}`), 1200);
    } catch {
      showPopup("Error sending invites", "error");
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="am-wrap">
        <div className="am-card glass">
          <div className="am-left">
            <div className="am-logo">
              <img src={squadUpLogo} alt="SquadUp" />
            </div>
            <h1>SquadUp</h1>
            <p>Invite your squad members</p>
            <div className="am-dots"><span /><span /><span /></div>
          </div>

          <div className="am-right">
            <h2>Add Members</h2>
            <p className="am-sub">Type email and press <strong>Enter</strong> to add</p>

            <div className="am-count">
              <span>📧</span> {emails.length} email{emails.length !== 1 ? "s" : ""} added
            </div>

            <div className="am-email-box">
              {emails.map((email, i) => (
                <div key={i} className="am-tag">
                  {email}
                  <span onClick={() => removeEmail(email)}>×</span>
                </div>
              ))}
              <input
                className="am-email-input"
                type="text"
                placeholder="Enter email and press Enter..."
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="am-btns">
              <button className="t-btn-outline am-back" onClick={() => navigate("/dashboard")}>← Back</button>
              <button className="t-btn am-send" onClick={sendInvite} disabled={loading}>
                {loading ? "Sending..." : "Send Invitations →"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {popup && <div className={`t-toast ${popup.type}`}>{popup.message}</div>}

      <style>{`
        .am-wrap { min-height:100vh; display:flex; justify-content:center; align-items:center; background:transparent; padding:20px; }
        .am-card { display:flex; width:860px; min-height:500px; border-radius:24px; overflow:hidden; box-shadow:var(--shadow); }
        .am-left { width:40%; background:linear-gradient(160deg,#3b0764,#7c3aed); display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:50px 30px; }
        .am-logo { width:90px; height:90px; border-radius:50%; overflow:hidden; border:3px solid rgba(255,255,255,0.25); box-shadow:0 0 40px rgba(168,85,247,0.5); margin-bottom:20px; }
        .am-logo img { width:100%; height:100%; object-fit:cover; }
        .am-left h1 { font-size:26px; font-weight:800; color:white; margin-bottom:8px; }
        .am-left p { font-size:14px; color:rgba(255,255,255,0.75); }
        .am-dots { display:flex; gap:8px; margin-top:28px; }
        .am-dots span { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.3); }
        .am-dots span:first-child { background:white; }

        .am-right { width:60%; padding:50px 44px; background:var(--bg2); display:flex; flex-direction:column; justify-content:center; }
        .am-right h2 { font-size:24px; font-weight:700; margin-bottom:6px; }
        .am-sub { color:var(--text-muted); font-size:14px; margin-bottom:24px; }
        .am-sub strong { color:var(--accent2); }

        .am-count { background:rgba(124,58,237,0.1); border:1px solid rgba(124,58,237,0.2); color:var(--accent2); padding:10px 16px; border-radius:10px; font-size:13px; font-weight:500; margin-bottom:16px; display:flex; align-items:center; gap:8px; }

        .am-email-box { display:flex; flex-wrap:wrap; gap:8px; padding:12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; min-height:60px; margin-bottom:20px; transition:border-color .2s; }
        .am-email-box:focus-within { border-color:var(--accent); box-shadow:0 0 0 3px rgba(124,58,237,0.15); }

        .am-tag { background:rgba(124,58,237,0.15); border:1px solid rgba(124,58,237,0.3); color:var(--accent2); padding:6px 12px; border-radius:20px; display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; }
        .am-tag span { cursor:pointer; font-weight:700; color:var(--accent2); opacity:.7; transition:opacity .2s; }
        .am-tag span:hover { opacity:1; }

        .am-email-input { border:none; outline:none; flex:1; min-width:180px; background:transparent; color:var(--text); font-size:14px; font-family:inherit; }
        .am-email-input::placeholder { color:var(--text-muted); }

        .am-btns { display:flex; gap:12px; }
        .am-back { flex:1; padding:13px; }
        .am-send { flex:2; }

        @media(max-width:700px){ .am-card{flex-direction:column;width:100%;} .am-left,.am-right{width:100%;padding:36px;} }
      `}</style>
    </>
  );
}

export default AddMembers;
