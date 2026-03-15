import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import squadUpLogo from "./squaduplogo.png";
import { API_URL } from "./config";
import socket from "./socket";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    axios.get(`${API_URL}/api/group/user/${u._id}`)
      .then(r => {
        setGroups(r.data);
        if (r.data.length > 0) {
          const ids = r.data.map(g => g._id).join(",");
          axios.get(`${API_URL}/api/messages/unread?groupIds=${ids}&userEmail=${encodeURIComponent(u.email || "")}`)
            .then(res => setUnreadCounts(res.data))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setTimeout(() => setMounted(true), 50); });
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const handleNewMsg = (msg) => {
      if (msg.senderEmail !== user.email) {
        setUnreadCounts(prev => ({ ...prev, [msg.groupId]: (prev[msg.groupId] || 0) + 1 }));
      }
    };
    socket.on("receiveMessage", handleNewMsg);
    return () => socket.off("receiveMessage", handleNewMsg);
  }, [user]);

  if (loading) return (
    <div className="db-loading">
      <div className="db-loader-ring">
        <div /><div /><div /><div />
      </div>
      <p>Loading your workspace...</p>
    </div>
  );
  if (!user) return null;

  const initial = user.fullName?.charAt(0).toUpperCase();
  const filtered = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const adminGroups = groups.filter(g => g.adminEmail === user.email).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const colors = [
    ["#0b3e71","#1565c0"], ["#6a1b9a","#ab47bc"], ["#00695c","#26a69a"],
    ["#bf360c","#ef6c00"], ["#1565c0","#42a5f5"], ["#2e7d32","#66bb6a"],
  ];

  return (
    <>
      <div className={`db-wrap ${mounted ? "db-mounted" : ""}`}>

        {/* ── PARTICLES ── */}
        {[...Array(8)].map((_, i) => <div key={i} className={`db-particle db-p${i}`} />)}

        {/* ── NAV SPACER ── */}
        <div className="db-nav-spacer" />

        {/* ── NAVBAR ── */}
        <nav className="db-nav">
          <div className="db-brand" onClick={() => navigate("/")} title="Home">
            <img src={squadUpLogo} alt="logo" />
            <span>SquadUp</span>
          </div>
          <div className="db-nav-center">
            <span className="db-wave">👋</span>
            <span>{greeting}, <strong>{user.fullName}</strong></span>
          </div>
          <div className="db-nav-right">
            {totalUnread > 0 && (
              <div className="db-notif-dot">{totalUnread}</div>
            )}
            <button className="db-create-nav-btn" onClick={() => navigate("/create-group")}>
              <span>＋</span> Create Group
            </button>
            <div className="db-avatar" onClick={() => navigate("/profile")} title="Profile">
              {initial}
              <div className="db-avatar-ring" />
            </div>
            <button className="db-logout" onClick={() => { localStorage.clear(); navigate("/login"); }}>
              Logout
            </button>
          </div>
        </nav>

        {/* ── BODY ── */}
        <div className="db-body">

          {/* ── STATS ROW ── */}
          <div className="db-stats">
            {[
              { icon: "👥", label: "Total Groups",   val: groups.length },
              { icon: "👑", label: "Admin Of",        val: adminGroups },
              { icon: "💬", label: "Unread Messages", val: totalUnread },
              { icon: "👤", label: "Members Total",   val: groups.reduce((a, g) => a + g.memberCount, 0) },
            ].map((s, i) => (
              <div key={i} className="db-stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="db-stat-icon">{s.icon}</div>
                <div className="db-stat-val">{s.val}</div>
                <div className="db-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── SEARCH ── */}
          <div className="db-search-wrap">
            <span className="db-search-icon">🔍</span>
            <input
              className="db-search"
              placeholder="Search groups..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="db-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          {/* ── GROUP LIST ── */}
          {filtered.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon">🏘️</div>
              <h3>{search ? "No groups match your search" : "No groups yet"}</h3>
              <p>{search ? "Try a different keyword" : "Create a group or wait for an invite to get started."}</p>
              {!search && (
                <button onClick={() => navigate("/create-group")}>＋ Create Group</button>
              )}
            </div>
          ) : (
            <div className="db-list">
              <div className="db-list-header">
                <span>Groups ({filtered.length})</span>
              </div>
              {filtered.map((g, i) => {
                const [c1, c2] = colors[i % colors.length];
                const isAdmin = g.adminEmail === user.email;
                const unread = unreadCounts[g._id] || 0;
                return (
                  <div
                    key={g._id}
                    className="db-group-row"
                    style={{ animationDelay: `${i * 0.07}s` }}
                    onClick={() => {
                      setUnreadCounts(prev => ({ ...prev, [g._id]: 0 }));
                      navigate(`/messages/${g._id}`);
                    }}
                  >
                    {/* Avatar */}
                    <div className="db-group-avatar" style={{ background: `linear-gradient(135deg,${c1},${c2})` }}>
                      {g.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="db-group-info">
                      <div className="db-group-name">{g.name}</div>
                      <div className="db-group-meta">
                        <span>👥 {g.memberCount} members</span>
                        {isAdmin && <span className="db-admin-pill">👑 Admin</span>}
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="db-group-right">
                      {unread > 0 && (
                        <span className="db-unread-badge">{unread > 99 ? "99+" : unread}</span>
                      )}
                      <div className="db-row-arrow">›</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; font-family:'Poppins',sans-serif; }

        /* ── LOADING ── */
        .db-loading {
          height:100vh; display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:20px;
          background:linear-gradient(135deg,#0b3e71,#071e38);
        }
        .db-loader-ring {
          display:inline-block; position:relative; width:64px; height:64px;
        }
        .db-loader-ring div {
          box-sizing:border-box; display:block; position:absolute;
          width:48px; height:48px; margin:8px;
          border:5px solid transparent; border-top-color:#fff;
          border-radius:50%; animation:db-ring 1.2s cubic-bezier(.5,0,.5,1) infinite;
        }
        .db-loader-ring div:nth-child(1){animation-delay:-.45s}
        .db-loader-ring div:nth-child(2){animation-delay:-.3s}
        .db-loader-ring div:nth-child(3){animation-delay:-.15s}
        @keyframes db-ring{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
        .db-loading p { color:rgba(255,255,255,.7); font-size:14px; }

        /* ── WRAP ── */
        .db-wrap {
          min-height:100vh;
          background:linear-gradient(160deg,#f0f4ff 0%,#e8f0fe 50%,#f4f7ff 100%);
          position:relative; overflow-x:hidden;
        }

        /* ── PARTICLES ── */
        .db-particle {
          position:fixed; border-radius:50%; pointer-events:none;
          opacity:0; animation:db-float 15s ease-in-out infinite;
        }
        .db-mounted .db-particle { opacity:.06; }
        .db-p0{width:120px;height:120px;background:#0b3e71;top:8%;left:2%;animation-delay:0s}
        .db-p1{width:70px;height:70px;background:#1565c0;top:25%;right:4%;animation-delay:3s}
        .db-p2{width:90px;height:90px;background:#6a1b9a;top:55%;left:1%;animation-delay:6s}
        .db-p3{width:50px;height:50px;background:#00695c;bottom:25%;right:3%;animation-delay:2s}
        .db-p4{width:60px;height:60px;background:#bf360c;top:75%;left:45%;animation-delay:4s}
        .db-p5{width:80px;height:80px;background:#1565c0;top:40%;right:15%;animation-delay:7s}
        .db-p6{width:40px;height:40px;background:#2e7d32;top:15%;left:40%;animation-delay:1s}
        .db-p7{width:55px;height:55px;background:#0b3e71;bottom:10%;left:20%;animation-delay:5s}
        @keyframes db-float{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-25px) rotate(120deg)}66%{transform:translateY(15px) rotate(240deg)}}

        /* ── NAV SPACER ── */
        .db-nav-spacer {
          height:0.5rem;
          background:#071e38;
          position:fixed;
          top:0; left:0; right:0;
          z-index:201;
        }

        /* ── NAVBAR ── */
        .db-nav {
          position:fixed;
          top:0.5rem;
          left:0; right:0;
          z-index:200;
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:16px 60px;
          background:rgba(7,30,56,0.95);
          backdrop-filter:blur(16px);
          border-bottom:1px solid rgba(255,255,255,.08);
          box-shadow:0 4px 24px rgba(11,62,113,.35);
        }

        .db-brand {
          display:flex; align-items:center; gap:10px;
          font-size:18px; font-weight:700; color:#fff;
          cursor:pointer; flex-shrink:0; transition:.2s;
        }
        .db-brand:hover { opacity:.85; transform:scale(1.03); }
        .db-brand img { width:34px; height:34px; border-radius:50%; object-fit:cover; border:2px solid rgba(255,255,255,.4); }

        .db-nav-center {
          flex:1; display:flex; align-items:center; gap:8px;
          color:#fff; font-size:14px; opacity:.92;
          padding-left:20px; border-left:1px solid rgba(255,255,255,.2);
        }
        .db-wave { font-size:18px; animation:db-wave 2.5s ease-in-out infinite; display:inline-block; }
        @keyframes db-wave{0%,100%{transform:rotate(0)}20%{transform:rotate(20deg)}60%{transform:rotate(-12deg)}}

        .db-nav-right { display:flex; align-items:center; gap:12px; flex-shrink:0; position:relative; }

        .db-notif-dot {
          background:#ff4444; color:#fff;
          font-size:11px; font-weight:700;
          min-width:22px; height:22px; border-radius:11px;
          display:flex; align-items:center; justify-content:center;
          padding:0 6px; animation:db-pulse 2s ease-in-out infinite;
        }
        @keyframes db-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}

        .db-avatar {
          width:38px; height:38px; border-radius:50%;
          background:rgba(255,255,255,.2); border:2px solid rgba(255,255,255,.5);
          color:#fff; font-weight:700; font-size:15px;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:.25s; position:relative;
        }
        .db-avatar:hover { background:rgba(255,255,255,.35); transform:scale(1.1); }
        .db-avatar-ring {
          position:absolute; inset:-4px; border-radius:50%;
          border:2px solid rgba(255,255,255,.3);
          animation:db-spin-ring 3s linear infinite;
        }
        @keyframes db-spin-ring{to{transform:rotate(360deg)}}

        .db-logout {
          background:transparent; border:1.5px solid rgba(255,255,255,.4);
          color:rgba(255,255,255,.9); padding:7px 16px; border-radius:8px;
          cursor:pointer; font-size:12px; font-weight:500; transition:.2s;
        }
        .db-logout:hover { border-color:#fff; color:#fff; background:rgba(255,255,255,.1); }

        /* ── BODY ── */
        .db-body { max-width:900px; margin:0 auto; padding:36px 24px 80px; margin-top:90px; }

        @keyframes db-fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}

        .db-create-nav-btn {
          background:rgba(255,255,255,.15); color:#fff;
          border:1.5px solid rgba(255,255,255,.4); padding:8px 18px;
          border-radius:50px; font-size:13px; font-weight:600;
          cursor:pointer; white-space:nowrap;
          display:flex; align-items:center; gap:6px;
          transition:.22s; backdrop-filter:blur(8px);
        }
        .db-create-nav-btn:hover { background:rgba(255,255,255,.28); border-color:#fff; transform:translateY(-1px); }

        /* ── STATS ── */
        .db-stats {
          display:grid; grid-template-columns:repeat(4,1fr); gap:16px;
          margin-bottom:28px;
        }
        .db-stat-card {
          background:#fff; border-radius:18px; padding:22px 16px;
          text-align:center;
          box-shadow:0 4px 16px rgba(11,62,113,.07);
          border:1.5px solid #e8f0fe;
          animation:db-fadeUp .6s ease both;
          transition:.25s;
        }
        .db-stat-card:hover { transform:translateY(-4px); box-shadow:0 12px 30px rgba(11,62,113,.13); border-color:#c5d8ff; }
        .db-stat-icon { font-size:28px; margin-bottom:8px; }
        .db-stat-val { font-size:28px; font-weight:800; color:#0b3e71; line-height:1; margin-bottom:4px; }
        .db-stat-label { font-size:12px; color:#8a9bbf; font-weight:500; }

        /* ── SEARCH ── */
        .db-search-wrap { position:relative; margin-bottom:20px; }
        .db-search-icon { position:absolute; left:16px; top:50%; transform:translateY(-50%); font-size:15px; pointer-events:none; }
        .db-search {
          width:100%; padding:13px 44px 13px 46px;
          border:1.5px solid #dce8ff; border-radius:14px;
          font-size:14px; background:#fff; outline:none;
          transition:border-color .2s, box-shadow .2s; color:#1a1a2e;
          box-shadow:0 2px 8px rgba(11,62,113,.05);
        }
        .db-search:focus { border-color:#1565c0; box-shadow:0 0 0 3px rgba(21,101,192,.1); }
        .db-search-clear {
          position:absolute; right:14px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; color:#aaa; font-size:14px;
          transition:.2s;
        }
        .db-search-clear:hover { color:#0b3e71; }

        /* ── LIST HEADER ── */
        .db-list-header {
          font-size:12px; font-weight:700; color:#8a9bbf;
          text-transform:uppercase; letter-spacing:1.5px;
          margin-bottom:12px; padding:0 4px;
        }

        /* ── GROUP ROW ── */
        .db-list { display:flex; flex-direction:column; gap:10px; }

        .db-group-row {
          background:#fff; border-radius:18px; padding:16px 20px;
          display:flex; align-items:center; gap:16px;
          cursor:pointer;
          box-shadow:0 2px 12px rgba(11,62,113,.06);
          border:1.5px solid transparent;
          transition:all .22s ease;
          animation:db-rowIn .45s ease both;
          position:relative; overflow:hidden;
        }
        .db-group-row::before {
          content:''; position:absolute; left:0; top:0; bottom:0;
          width:4px; border-radius:4px 0 0 4px;
          background:linear-gradient(180deg,#0b3e71,#1565c0);
          transform:scaleY(0); transition:.22s; transform-origin:center;
        }
        .db-group-row:hover::before { transform:scaleY(1); }
        @keyframes db-rowIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
        .db-group-row:hover {
          border-color:#c5d8ff;
          box-shadow:0 8px 28px rgba(11,62,113,.13);
          transform:translateX(4px);
        }

        .db-group-avatar {
          width:52px; height:52px; border-radius:16px;
          color:#fff; font-size:22px; font-weight:700;
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0; box-shadow:0 4px 12px rgba(0,0,0,.15);
          transition:.22s;
        }
        .db-group-row:hover .db-group-avatar { transform:scale(1.08) rotate(-3deg); }

        .db-group-info { flex:1; min-width:0; }
        .db-group-name {
          font-size:15px; font-weight:700; color:#0d1b2e;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
          margin-bottom:5px;
        }
        .db-group-meta { font-size:12px; color:#8a9bbf; display:flex; align-items:center; gap:8px; }
        .db-admin-pill {
          background:linear-gradient(135deg,#fff3cd,#ffeaa7);
          color:#856404; font-size:10px; font-weight:700;
          padding:2px 8px; border-radius:20px; border:1px solid #ffd700;
        }

        .db-group-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }

        .db-unread-badge {
          background:linear-gradient(135deg,#e53935,#ff5252);
          color:#fff; font-size:11px; font-weight:700;
          min-width:22px; height:22px; border-radius:11px;
          display:flex; align-items:center; justify-content:center;
          padding:0 6px; animation:db-pulse 2s ease-in-out infinite;
          box-shadow:0 2px 8px rgba(229,57,53,.4);
        }

        .db-row-arrow {
          font-size:24px; color:#c5d8ff; font-weight:300;
          transition:.22s;
        }
        .db-group-row:hover .db-row-arrow { color:#1565c0; transform:translateX(4px); }

        /* ── EMPTY ── */
        .db-empty {
          background:#fff; border-radius:24px; padding:72px 24px;
          text-align:center; box-shadow:0 4px 20px rgba(11,62,113,.06);
          animation:db-fadeUp .6s ease both;
        }
        .db-empty-icon { font-size:60px; margin-bottom:18px; animation:db-bounce 2s ease-in-out infinite; }
        @keyframes db-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .db-empty h3 { font-size:20px; color:#0b3e71; margin-bottom:8px; font-weight:700; }
        .db-empty p  { font-size:14px; color:#888; margin-bottom:28px; }
        .db-empty button {
          background:linear-gradient(135deg,#0b3e71,#1565c0);
          color:#fff; border:none; padding:13px 32px;
          border-radius:50px; font-size:14px; font-weight:600; cursor:pointer;
          box-shadow:0 6px 20px rgba(11,62,113,.3); transition:.25s;
        }
        .db-empty button:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(11,62,113,.4); }

        /* ── RESPONSIVE ── */
        @media(max-width:700px){
          .db-nav { padding:14px 16px; }
          .db-nav-center { display:none; }
          .db-body { padding:20px 14px 60px; margin-top:80px; }
          .db-stats { grid-template-columns:repeat(2,1fr); }
          .db-group-row { padding:14px 14px; }
        }
      `}</style>
    </>
  );
}

export default Dashboard;
