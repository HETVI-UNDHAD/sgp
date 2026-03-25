import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import squadUpLogo from "./squaduplogo.png";
import { API_URL } from "./config";
import "./theme.css";

function AcceptInvite() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying invitation...");

  useEffect(() => {
    const acceptInvite = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invite link is invalid or expired. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2500);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/group/accept`, { params: { token } });

        if (res.data.status === "NOT_REGISTERED") {
          setStatus("info");
          setMessage("You need to register first to join this group. Redirecting...");
          setTimeout(() => navigate("/register", { state: { email: res.data.email, groupId: res.data.groupId } }), 2000);
          return;
        }

        if (res.data.status === "ACCEPTED") {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          setStatus("success");
          setMessage("Successfully joined the group 🎉 Redirecting...");
          setTimeout(() => navigate(`/messages/${res.data.groupId}`), 2000);
        }

      } catch (err) {
        setStatus("error");
        setMessage("Invite link is invalid or expired. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2500);
      }
    };

    acceptInvite();
  }, [navigate]);

  return (
    <>
      <div className="ai-wrap">
        <div className="ai-card glass">
          <div className="ai-logo">
            <img src={squadUpLogo} alt="SquadUp" />
          </div>
          <h2>SquadUp</h2>

          {status === "loading" && <div className="ai-spinner" />}

          <p className={`ai-msg ai-${status}`}>{message}</p>
        </div>
      </div>

      <style>{`
        .ai-wrap { min-height:100vh; display:flex; justify-content:center; align-items:center; background:transparent; padding:20px; }
        .ai-card { padding:50px 40px; text-align:center; width:420px; }
        .ai-logo { width:80px; height:80px; border-radius:50%; overflow:hidden; border:3px solid rgba(255,255,255,0.2); box-shadow:0 0 40px rgba(168,85,247,0.4); margin:0 auto 16px; }
        .ai-logo img { width:100%; height:100%; object-fit:cover; }
        .ai-card h2 { font-size:24px; font-weight:800; color:var(--accent2); margin-bottom:24px; }
        .ai-spinner { width:44px; height:44px; border:3px solid rgba(255,255,255,0.1); border-top-color:var(--accent); border-radius:50%; margin:0 auto 20px; animation:spin .9s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .ai-msg { font-size:15px; font-weight:500; margin-top:8px; line-height:1.6; }
        .ai-loading { color:var(--text-muted); }
        .ai-success { color:#10b981; }
        .ai-error   { color:#ef4444; }
        .ai-info    { color:var(--accent2); }
      `}</style>
    </>
  );
}

export default AcceptInvite;
