import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";

function MyGroups() {
  const [groups, setGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user?._id) { navigate("/login"); return; }
    Promise.all([
      axios.get(`${API_URL}/api/group/user/${user._id}`),
      axios.get(`${API_URL}/api/group/invitations/${user.email}`),
    ]).then(([g, i]) => { setGroups(g.data); setInvitations(i.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?._id, user?.email, navigate]);

  const acceptInvitation = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/group/accept`, { params: { token } });
      if (res.data.status === "ACCEPTED") {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.location.reload();
      } else if (res.data.status === "NOT_REGISTERED") {
        navigate("/register");
      }
    } catch { alert("Failed to accept invitation"); }
  };

  if (loading) return <div className="mg-loading"><div className="db-spinner" /></div>;

  return (
    <>
      <div className="mg-wrap">

        {/* HEADER */}
        <div className="mg-header">
          <div>
            <h2>My Groups</h2>
            <p>View and manage your joined groups</p>
          </div>
          <div className="mg-header-actions">
            <button className="t-btn-outline mg-back" onClick={() => navigate("/dashboard")}>← Dashboard</button>
            <button className="t-btn mg-new" onClick={() => navigate("/create-group")}>+ New Group</button>
          </div>
        </div>

        {/* INVITATIONS */}
        {invitations.length > 0 && (
          <div className="mg-section">
            <p className="mg-sec-label">PENDING INVITATIONS</p>
            <div className="mg-inv-grid">
              {invitations.map(inv => (
                <div key={inv._id} className="mg-inv-card glass">
                  <div className="mg-inv-icon">📩</div>
                  <div className="mg-inv-info">
                    <h4>{inv.groupId.name}</h4>
                    <p>From: {inv.groupId.admin?.email}</p>
                  </div>
                  <button className="t-btn mg-accept-btn" onClick={() => acceptInvitation(inv.token)}>
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GROUPS */}
        <div className="mg-section">
          <p className="mg-sec-label">ALL GROUPS ({groups.length})</p>
          {groups.length === 0 ? (
            <div className="mg-empty glass">
              <p>👥</p>
              <h3>No groups yet</h3>
              <p>Create or join a group to get started.</p>
              <button className="t-btn mg-empty-btn" onClick={() => navigate("/create-group")}>Create Group</button>
            </div>
          ) : (
            <div className="mg-grid">
              {groups.map(g => (
                <div key={g._id} className="mg-card glass">
                  <div className="mg-card-top">
                    <div className="mg-card-avatar">{g.name.charAt(0).toUpperCase()}</div>
                    <div className="mg-card-badge">{g.adminEmail === user.email ? "Admin" : "Member"}</div>
                  </div>
                  <h3>{g.name}</h3>
                  <div className="mg-card-meta">
                    <span>👤 {g.adminEmail}</span>
                    <span>👥 {g.memberCount} members</span>
                  </div>
                  <div className="mg-avatars">
                    {g.members.slice(0, 5).map((m, i) => (
                      <div key={i} className="mg-mini-avatar" title={m.fullName || m.email}>
                        {(m.fullName || m.email || "U").charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {g.memberCount > 5 && <div className="mg-mini-avatar">+{g.memberCount - 5}</div>}
                  </div>
                  <details className="mg-details">
                    <summary>View all members</summary>
                    <ul>
                      {g.members.map((m, i) => <li key={i}>{m.email} ({m.fullName || "Unknown"})</li>)}
                    </ul>
                  </details>
                  <button className="t-btn mg-open-btn" onClick={() => navigate(`/messages/${g._id}`)}>
                    Open Group →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .mg-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
        }
        .db-spinner {
          width: 40px; height: 40px;
          border: 3px solid var(--card-border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .mg-wrap {
          min-height: 100vh;
          background: transparent;
          padding: 32px;
        }

        .mg-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 36px;
        }
        .mg-header h2 { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
        .mg-header p { color: var(--text-muted); font-size: 14px; }
        .mg-header-actions { display: flex; gap: 12px; }
        .mg-back { width: auto; padding: 10px 18px; }
        .mg-new { width: auto; padding: 10px 18px; }

        .mg-section { margin-bottom: 36px; }
        .mg-sec-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: var(--accent2);
          margin-bottom: 16px;
        }

        /* INVITATIONS */
        .mg-inv-grid { display: flex; flex-direction: column; gap: 12px; }
        .mg-inv-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 22px;
        }
        .mg-inv-icon { font-size: 24px; }
        .mg-inv-info { flex: 1; }
        .mg-inv-info h4 { font-size: 15px; font-weight: 600; margin-bottom: 3px; }
        .mg-inv-info p { font-size: 13px; color: var(--text-muted); }
        .mg-accept-btn { width: auto; padding: 9px 20px; }

        /* GROUPS GRID */
        .mg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .mg-card { padding: 24px; transition: transform 0.2s, box-shadow 0.2s; }
        .mg-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(124,58,237,0.15); }

        .mg-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .mg-card-avatar {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: white;
          font-size: 22px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mg-card-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(124,58,237,0.15);
          color: var(--accent2);
          border: 1px solid rgba(124,58,237,0.25);
        }
        .mg-card h3 { font-size: 17px; font-weight: 600; margin-bottom: 10px; }
        .mg-card-meta { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--text-muted); margin-bottom: 14px; }

        .mg-avatars { display: flex; gap: 6px; margin-bottom: 14px; }
        .mg-mini-avatar {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: var(--card);
          border: 2px solid var(--card-border);
          color: var(--text);
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mg-details {
          border: 1px solid var(--card-border);
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 14px;
          font-size: 13px;
        }
        .mg-details summary { cursor: pointer; color: var(--accent2); font-weight: 500; list-style: none; }
        .mg-details ul { padding-left: 16px; margin-top: 10px; }
        .mg-details li { color: var(--text-muted); margin-bottom: 4px; }

        .mg-open-btn { padding: 11px; }

        .mg-empty {
          padding: 60px;
          text-align: center;
          max-width: 400px;
          margin: auto;
        }
        .mg-empty p:first-child { font-size: 48px; margin-bottom: 12px; }
        .mg-empty h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
        .mg-empty p { color: var(--text-muted); font-size: 14px; margin-bottom: 20px; }
        .mg-empty-btn { width: auto; padding: 12px 28px; margin: auto; }

        @media (max-width: 768px) {
          .mg-wrap { padding: 20px; }
          .mg-header { flex-direction: column; gap: 16px; align-items: flex-start; }
          .mg-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}

export default MyGroups;
