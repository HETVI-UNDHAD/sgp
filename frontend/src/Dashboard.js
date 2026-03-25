import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import squadUpLogo from "./squaduplogo.png";
import { API_URL } from "./config";
import "./theme.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0 });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login"); return; }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    setLoading(false);
    axios.get(`${API_URL}/api/group/user/${parsed._id}`)
      .then(res => setGroups(res.data)).catch(() => {});
  }, [navigate]);

  if (loading) return <div className="db-loading"><div className="db-spinner" /></div>;
  if (!user) return null;

  const firstLetter = user.fullName?.charAt(0).toUpperCase();
  const groupsCreated = groups.filter(g => g.adminEmail === user.email).length;
  const groupsJoined = groups.length - groupsCreated;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const quickActions = [
    { icon: "➕", label: "Create Group", sub: "Start a new squad", path: "/create-group", color: "#7c3aed" },
    { icon: "👥", label: "My Groups", sub: "View all groups", path: "/my-groups", color: "#0ea5e9" },
    { icon: "👤", label: "Edit Profile", sub: "Update your info", path: "/profile", color: "#10b981" },
  ];

  return (
    <>
      <div className="db-wrap">
        {/* SIDEBAR */}
        <aside className="db-sidebar">
          <div className="db-sidebar-brand">
            <img src={squadUpLogo} alt="logo" /><span>SquadUp</span>
          </div>
          <nav className="db-nav">
            <button className="db-nav-item active" onClick={() => navigate("/dashboard")}><span>🏠</span> Dashboard</button>
            <button className="db-nav-item" onClick={() => navigate("/my-groups")}><span>👥</span> My Groups</button>
            <button className="db-nav-item" onClick={() => navigate("/create-group")}><span>➕</span> Create Group</button>
            <button className="db-nav-item" onClick={() => navigate("/profile")}><span>👤</span> Profile</button>
          </nav>
          <div className="db-sidebar-label">GROUPS</div>
          <div className="db-sidebar-groups">
            {groups.length === 0
              ? <p className="db-empty-groups">No groups yet</p>
              : groups.map(g => (
                <div
                  key={g._id}
                  className="db-group-item"
                  onClick={() => navigate(`/messages/${g._id}`)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPos({ top: rect.top });
                    setHoveredGroup(g);
                  }}
                  onMouseLeave={() => setHoveredGroup(null)}
                >
                  <div className="db-group-dot">{g.name.charAt(0).toUpperCase()}</div>
                  <span>{g.name}</span>
                </div>
              ))
            }
          </div>
          <div className="db-sidebar-footer">
            <div className="db-user-info" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="db-avatar-sm">{firstLetter}</div>
              <div><p className="db-user-name">{user.fullName}</p><p className="db-user-email">{user.email}</p></div>
            </div>
            {showProfileMenu && (
              <div className="db-profile-popup glass">
                <div className="db-popup-stats">
                  <span>Joined: {groups.length}</span>
                  <span>Created: {groupsCreated}</span>
                </div>
                <button onClick={() => { navigate("/profile"); setShowProfileMenu(false); }}>Edit Profile</button>
                <button className="db-logout-item" onClick={() => { localStorage.clear(); navigate("/login"); }}>Logout</button>
              </div>
            )}
          </div>
        </aside>

        {/* GROUP HOVER TOOLTIP */}
        {hoveredGroup && (
          <div
            className="db-group-tooltip"
            style={{ top: tooltipPos.top }}
            onMouseEnter={() => setHoveredGroup(hoveredGroup)}
            onMouseLeave={() => setHoveredGroup(null)}
          >
            <div className="dgt-header">
              <div className="dgt-avatar">{hoveredGroup.name.charAt(0).toUpperCase()}</div>
              <div>
                <p className="dgt-name">{hoveredGroup.name}</p>
                <span className={`dgt-badge ${hoveredGroup.adminEmail === user.email ? "admin" : "member"}`}>
                  {hoveredGroup.adminEmail === user.email ? "👑 Admin" : "👤 Member"}
                </span>
              </div>
            </div>
            <div className="dgt-divider" />
            <div className="dgt-row"><span className="dgt-lbl">Admin</span><span className="dgt-val">{hoveredGroup.adminEmail}</span></div>
            <div className="dgt-row"><span className="dgt-lbl">Members</span><span className="dgt-val">{hoveredGroup.memberCount}</span></div>
            {hoveredGroup.members?.slice(0, 4).map((m, i) => (
              <div key={i} className="dgt-member">
                <div className="dgt-m-avatar">{(m.fullName || m.email || "U").charAt(0).toUpperCase()}</div>
                <span>{m.fullName || m.email}</span>
              </div>
            ))}
            {hoveredGroup.memberCount > 4 && <p className="dgt-more">+{hoveredGroup.memberCount - 4} more members</p>}
            <div className="dgt-divider" />
            <button className="dgt-btn" onClick={() => { setHoveredGroup(null); navigate(`/messages/${hoveredGroup._id}`); }}>💬 Open Chat</button>
          </div>
        )}

        {/* MAIN */}
        <main className="db-main">
          <div className="db-content">

            {/* WELCOME BANNER */}
            <div className="db-banner glass">
              <div className="db-banner-left">
                <p className="db-greeting">{getGreeting()},</p>
                <h2 className="db-name">{user.fullName} 👋</h2>
                <p className="db-tagline">Here's what's happening with your squads today.</p>
              </div>
              <button className="db-banner-btn" onClick={() => navigate("/create-group")}>+ New Group</button>
            </div>

            {/* STATS */}
            <div className="db-stats-row">
              <div className="db-stat-card glass">
                <div className="db-stat-icon" style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>👥</div>
                <div>
                  <p className="db-stat-label">Total Groups</p>
                  <h2 className="db-stat-num">{groups.length}</h2>
                </div>
              </div>
              <div className="db-stat-card glass">
                <div className="db-stat-icon" style={{ background: "rgba(14,165,233,0.15)", color: "#38bdf8" }}>🛡️</div>
                <div>
                  <p className="db-stat-label">Groups Created</p>
                  <h2 className="db-stat-num">{groupsCreated}</h2>
                </div>
              </div>
              <div className="db-stat-card glass">
                <div className="db-stat-icon" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>🤝</div>
                <div>
                  <p className="db-stat-label">Groups Joined</p>
                  <h2 className="db-stat-num">{groupsJoined}</h2>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="db-section-title">Quick Actions</div>
            <div className="db-actions-row">
              {quickActions.map(a => (
                <div key={a.label} className="db-action-card glass" onClick={() => navigate(a.path)}>
                  <div className="db-action-icon" style={{ background: a.color + "22", color: a.color }}>{a.icon}</div>
                  <div>
                    <p className="db-action-label">{a.label}</p>
                    <p className="db-action-sub">{a.sub}</p>
                  </div>
                  <span className="db-action-arrow">→</span>
                </div>
              ))}
            </div>

            {/* PROFILE CARD */}
            <div className="db-section-title">Your Profile</div>
            <div className="db-profile-card glass">
              <div className="db-profile-avatar">{firstLetter}</div>
              <div className="db-profile-info">
                <h3>{user.fullName}</h3>
                <p>✉️ {user.email}</p>
                {user.phone && <p>📞 {user.phone}</p>}
                {user.educationType === "college" && <p>🎓 {user.collegeName} · {user.branch} · Sem {user.semester}</p>}
                {user.educationType === "school" && <p>🏫 {user.schoolName} · Std {user.standard} · {user.stream}</p>}
                {user.skills && <p>⚡ {user.skills}</p>}
                {user.bio && <p className="db-bio">"{user.bio}"</p>}
              </div>
              <button className="db-edit-btn" onClick={() => navigate("/profile")}>Edit Profile</button>
            </div>

            {/* RECENT GROUPS */}
            {groups.length > 0 && (
              <>
                <div className="db-section-title">Recent Groups</div>
                <div className="db-recent-grid">
                  {groups.slice(0, 4).map(g => (
                    <div key={g._id} className="db-recent-card glass" onClick={() => navigate(`/messages/${g._id}`)}>
                      <div className="db-recent-avatar">{g.name.charAt(0).toUpperCase()}</div>
                      <div className="db-recent-info">
                        <p className="db-recent-name">{g.name}</p>
                        <p className="db-recent-meta">
                          <span className={`db-role-badge ${g.adminEmail === user.email ? "admin" : "member"}`}>
                            {g.adminEmail === user.email ? "Admin" : "Member"}
                          </span>
                          · {g.memberCount} members
                        </p>
                      </div>
                      <span className="db-recent-arrow">→</span>
                    </div>
                  ))}
                </div>
                {groups.length > 4 && (
                  <button className="db-view-all" onClick={() => navigate("/my-groups")}>
                    View all {groups.length} groups →
                  </button>
                )}
              </>
            )}

          </div>
        </main>
      </div>

      <style>{`
        .db-loading { min-height:100vh; display:flex; align-items:center; justify-content:center; }
        .db-spinner { width:40px; height:40px; border:3px solid var(--card-border); border-top-color:var(--accent); border-radius:50%; animation:spin .8s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }

        .db-wrap { display:flex; min-height:100vh; background:transparent; }

        /* SIDEBAR */
        .db-sidebar { width:260px; min-height:100vh; background:rgba(13,13,26,0.9); backdrop-filter:blur(20px); border-right:1px solid var(--card-border); display:flex; flex-direction:column; padding:24px 16px; position:sticky; top:0; height:100vh; overflow-y:auto; }
        .db-sidebar-brand { display:flex; align-items:center; gap:10px; padding:0 8px; margin-bottom:32px; font-size:18px; font-weight:700; }
        .db-sidebar-brand img { width:34px; height:34px; border-radius:50%; }
        .db-nav { display:flex; flex-direction:column; gap:4px; margin-bottom:28px; }
        .db-nav-item { display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:10px; border:none; background:none; color:var(--text-muted); font-size:14px; cursor:pointer; text-align:left; transition:all .2s; }
        .db-nav-item:hover,.db-nav-item.active { background:rgba(124,58,237,0.12); color:var(--accent2); }
        .db-sidebar-label { font-size:11px; font-weight:700; letter-spacing:2px; color:var(--text-muted); padding:0 8px; margin-bottom:10px; }
        .db-sidebar-groups { flex:1; overflow-y:auto; }
        .db-empty-groups { font-size:13px; color:var(--text-muted); padding:0 8px; }
        .db-group-item { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:10px; cursor:pointer; font-size:13px; color:var(--text-muted); transition:all .2s; margin-bottom:2px; }
        .db-group-item:hover { background:rgba(124,58,237,0.1); color:var(--text); }
        .db-group-dot { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,var(--accent),var(--accent2)); color:white; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .db-sidebar-footer { margin-top:auto; padding-top:16px; border-top:1px solid var(--card-border); position:relative; }
        .db-user-info { display:flex; align-items:center; gap:10px; padding:10px; border-radius:10px; cursor:pointer; transition:background .2s; }
        .db-user-info:hover { background:var(--card); }
        .db-avatar-sm { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,var(--accent),var(--accent2)); color:white; font-weight:700; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
        .db-user-name { font-size:13px; font-weight:600; color:var(--text); }
        .db-user-email { font-size:11px; color:var(--text-muted); }
        .db-profile-popup { position:absolute; bottom:70px; left:0; right:0; padding:12px; border-radius:12px; z-index:50; background:#1a1a2e; border:1px solid var(--card-border); }
        .db-popup-stats { display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); padding:8px 4px; margin-bottom:8px; border-bottom:1px solid var(--card-border); }
        .db-profile-popup button { display:block; width:100%; padding:9px 12px; background:none; border:none; color:var(--text); font-size:13px; text-align:left; cursor:pointer; border-radius:8px; transition:background .2s; }
        .db-profile-popup button:hover { background:var(--card); }
        .db-logout-item { color:var(--error) !important; }

        /* MAIN */
        .db-main { flex:1; overflow-y:auto; }
        .db-content { padding:32px; display:flex; flex-direction:column; gap:24px; }

        /* BANNER */
        .db-banner { display:flex; justify-content:space-between; align-items:center; padding:32px 36px; background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(168,85,247,0.1)); border:1px solid rgba(124,58,237,0.25); }
        .db-greeting { font-size:14px; color:var(--accent2); font-weight:500; margin-bottom:4px; }
        .db-name { font-size:26px; font-weight:800; margin-bottom:6px; }
        .db-tagline { font-size:14px; color:var(--text-muted); }
        .db-banner-btn { background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#fff; border:none; padding:13px 28px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; white-space:nowrap; transition:.2s; box-shadow:0 4px 16px rgba(124,58,237,0.35); }
        .db-banner-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(124,58,237,0.45); }

        /* STATS */
        .db-stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .db-stat-card { display:flex; align-items:center; gap:18px; padding:24px 28px; }
        .db-stat-icon { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
        .db-stat-label { font-size:12px; color:var(--text-muted); font-weight:600; letter-spacing:.8px; text-transform:uppercase; margin-bottom:6px; }
        .db-stat-num { font-size:34px; font-weight:800; background:linear-gradient(135deg,var(--accent),var(--accent2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; line-height:1; }

        /* SECTION TITLE */
        .db-section-title { font-size:13px; font-weight:700; letter-spacing:1.5px; color:var(--text-muted); text-transform:uppercase; }

        /* QUICK ACTIONS */
        .db-actions-row { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .db-action-card { display:flex; align-items:center; gap:16px; padding:20px 22px; cursor:pointer; transition:all .2s; }
        .db-action-card:hover { transform:translateY(-3px); border-color:var(--accent); box-shadow:0 12px 32px rgba(124,58,237,0.15); }
        .db-action-icon { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
        .db-action-label { font-size:14px; font-weight:600; margin-bottom:2px; }
        .db-action-sub { font-size:12px; color:var(--text-muted); }
        .db-action-arrow { margin-left:auto; color:var(--text-muted); font-size:18px; }

        /* PROFILE CARD */
        .db-profile-card { display:flex; align-items:center; gap:22px; padding:26px 30px; }
        .db-profile-avatar { width:64px; height:64px; border-radius:50%; background:linear-gradient(135deg,var(--accent),var(--accent2)); color:white; font-size:26px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 0 24px rgba(124,58,237,0.3); }
        .db-profile-info { flex:1; }
        .db-profile-info h3 { font-size:17px; font-weight:700; margin-bottom:6px; }
        .db-profile-info p { font-size:13px; color:var(--text-muted); margin-bottom:4px; }
        .db-bio { font-style:italic; color:var(--accent2) !important; }
        .db-edit-btn { background:transparent; border:1px solid var(--card-border); color:var(--text); padding:10px 20px; border-radius:10px; cursor:pointer; font-size:13px; font-weight:500; white-space:nowrap; transition:.2s; }
        .db-edit-btn:hover { border-color:var(--accent); color:var(--accent2); }

        /* RECENT GROUPS */
        .db-recent-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; }
        .db-recent-card { display:flex; align-items:center; gap:14px; padding:18px 22px; cursor:pointer; transition:all .2s; }
        .db-recent-card:hover { border-color:var(--accent); transform:translateY(-2px); box-shadow:0 10px 28px rgba(124,58,237,0.12); }
        .db-recent-avatar { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,var(--accent),var(--accent2)); color:white; font-weight:700; font-size:18px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .db-recent-info { flex:1; }
        .db-recent-name { font-size:14px; font-weight:600; margin-bottom:4px; }
        .db-recent-meta { font-size:12px; color:var(--text-muted); display:flex; align-items:center; gap:6px; }
        .db-role-badge { font-size:11px; font-weight:600; padding:2px 8px; border-radius:20px; }
        .db-role-badge.admin { background:rgba(124,58,237,0.15); color:var(--accent2); }
        .db-role-badge.member { background:rgba(14,165,233,0.12); color:#38bdf8; }
        .db-recent-arrow { color:var(--text-muted); font-size:16px; }

        .db-view-all { background:none; border:1px solid var(--card-border); color:var(--text-muted); padding:11px 24px; border-radius:10px; cursor:pointer; font-size:13px; font-weight:500; transition:.2s; align-self:flex-start; }
        .db-view-all:hover { border-color:var(--accent); color:var(--accent2); }

        /* GROUP HOVER TOOLTIP */
        .db-group-tooltip {
          position:fixed;
          left:268px;
          width:260px;
          background:#1a1a2e;
          border:1px solid rgba(124,58,237,0.3);
          border-radius:16px;
          padding:18px;
          z-index:999;
          box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(124,58,237,0.1);
          animation:tooltipIn .15s ease;
        }
        @keyframes tooltipIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        .dgt-header { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .dgt-avatar { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,var(--accent),var(--accent2)); color:white; font-size:18px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .dgt-name { font-size:15px; font-weight:700; color:var(--text); margin-bottom:4px; }
        .dgt-badge { font-size:11px; font-weight:600; padding:2px 8px; border-radius:20px; }
        .dgt-badge.admin { background:rgba(124,58,237,0.2); color:#a78bfa; }
        .dgt-badge.member { background:rgba(14,165,233,0.15); color:#38bdf8; }
        .dgt-divider { height:1px; background:rgba(255,255,255,0.07); margin:12px 0; }
        .dgt-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
        .dgt-lbl { font-size:11px; color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:.5px; }
        .dgt-val { font-size:12px; color:var(--text); font-weight:500; max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .dgt-member { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
        .dgt-m-avatar { width:24px; height:24px; border-radius:50%; background:rgba(124,58,237,0.2); color:#a78bfa; font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .dgt-member span { font-size:12px; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .dgt-more { font-size:11px; color:var(--text-muted); margin-bottom:4px; }
        .dgt-btn { width:100%; padding:9px; background:linear-gradient(135deg,var(--accent),var(--accent2)); border:none; color:white; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; transition:.2s; margin-top:4px; }
        .dgt-btn:hover { opacity:.9; transform:translateY(-1px); }

        @media(max-width:900px) {
          .db-stats-row,.db-actions-row { grid-template-columns:1fr 1fr; }
        }
        @media(max-width:768px) {
          .db-sidebar { display:none; }
          .db-stats-row { grid-template-columns:1fr 1fr; }
          .db-actions-row { grid-template-columns:1fr; }
          .db-banner { flex-direction:column; gap:16px; align-items:flex-start; }
          .db-profile-card { flex-direction:column; text-align:center; }
          .db-content { padding:20px; }
        }
      `}</style>
    </>
  );
}
export default Dashboard;
