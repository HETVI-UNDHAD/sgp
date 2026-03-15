import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "./socket";
import { API_URL } from "./config";

function VideoCall() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [meetingLink, setMeetingLink] = useState("");
  const [roomName, setRoomName] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const jitsiRef = useRef(null);
  const apiRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    axios.get(`${API_URL}/api/group/${groupId}`).then(res => setGroup(res.data)).catch(console.error);

    socket.on("callStarted", (data) => {
      if (data.groupId === groupId && data.initiatorEmail !== user.email) {
        if (window.confirm(`📹 ${data.initiatorName} started a video call!\n\nClick OK to join now.`))
          window.open(data.meetingLink, "_blank");
      }
    });

    socket.on("callEnded", () => { setCallActive(false); setRoomName(""); setMeetingLink(""); });

    return () => { socket.off("callStarted"); socket.off("callEnded"); };
  }, [groupId, user.email]);

  // Load Jitsi iframe API script once
  useEffect(() => {
    if (document.getElementById("jitsi-script")) return;
    const script = document.createElement("script");
    script.id = "jitsi-script";
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Launch Jitsi when callActive becomes true
  useEffect(() => {
    if (!callActive || !roomName || !jitsiRef.current) return;

    const tryInit = () => {
      if (!window.JitsiMeetExternalAPI) { setTimeout(tryInit, 300); return; }

      if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; }

      apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName,
        parentNode: jitsiRef.current,
        width: "100%",
        height: "100%",
        userInfo: { displayName: user.fullName || user.email, email: user.email },
        configOverwrite: { startWithAudioMuted: false, startWithVideoMuted: false, prejoinPageEnabled: false },
        interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, SHOW_WATERMARK_FOR_GUESTS: false, TOOLBAR_BUTTONS: ["microphone","camera","hangup","chat","tileview","fullscreen","settings"] },
      });

      apiRef.current.addEventListener("readyToClose", () => {
        endCall();
      });
    };

    tryInit();

    return () => { if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; } };
  }, [callActive, roomName]);

  const startCall = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/call/start`, {
        groupId, initiatorEmail: user.email, initiatorName: user.fullName || user.email,
      });
      setRoomName(res.data.meetingCode);
      setMeetingLink(res.data.meetingLink);
      setCallActive(true);
    } catch { alert("Failed to start call"); }
    finally { setLoading(false); }
  };

  const endCall = async () => {
    try {
      if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; }
      await axios.post(`${API_URL}/api/call/end`, { meetingCode: roomName, groupId });
    } catch {}
    setCallActive(false); setRoomName(""); setMeetingLink("");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="vc-page">
        {/* Animated background */}
        <div className="vc-bg c1"/><div className="vc-bg c2"/><div className="vc-bg c3"/>

        {!callActive ? (
          /* ── PRE-CALL CARD ── */
          <div className="vc-card">
            <div className="vc-header">
              <button className="vc-back" onClick={() => navigate(`/group/${groupId}`)}>← Back</button>
              <div className="vc-title-row">
                <span>📹</span>
                <div>
                  <h2>{group?.groupName || "Group"}</h2>
                  <p>{group?.memberCount || 0} members</p>
                </div>
              </div>
            </div>

            <div className="vc-start">
              <div className="vc-anim">
                <div className="pr"/><div className="pr d1"/><div className="pr d2"/>
                <span className="vc-emoji">🎥</span>
              </div>
              <h3>Start a Video Meeting</h3>
              <p>Powered by <strong>Jitsi Meet</strong> — free, no account needed.<br/>Email invites sent to all members automatically.</p>
              <button className="vc-btn-start" onClick={startCall} disabled={loading}>
                {loading ? <span className="spin"/> : "📹 Create & Join Meeting"}
              </button>
            </div>
          </div>
        ) : (
          /* ── ACTIVE CALL FULL SCREEN ── */
          <div className="vc-fullscreen">
            {/* Top bar */}
            <div className="vc-topbar">
              <div className="vc-topbar-left">
                <span className="live-dot">🔴</span>
                <span className="live-label">LIVE</span>
                <span className="vc-room-name">{group?.groupName || "Meeting"}</span>
              </div>
              <div className="vc-topbar-right">
                <button className="copy-link-btn" onClick={copyLink}>
                  {copied ? "✅ Copied!" : "🔗 Copy Link"}
                </button>
                <a href={meetingLink} target="_blank" rel="noopener noreferrer" className="open-tab-btn">
                  ↗ Open in Tab
                </a>
                <button className="end-btn" onClick={endCall}>📵 End Call</button>
              </div>
            </div>

            {/* Jitsi iframe container */}
            <div className="jitsi-container" ref={jitsiRef} />
          </div>
        )}
      </div>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;font-family:'Poppins',sans-serif}

        .vc-page{
          min-height:100vh;
          background:linear-gradient(135deg,#0b3e71,#1565c0,#0d47a1);
          display:flex;align-items:center;justify-content:center;
          padding:20px;position:relative;overflow:hidden;
        }

        /* BG blobs */
        .vc-bg{position:absolute;border-radius:50%;filter:blur(70px);opacity:.2;animation:blob 9s ease-in-out infinite;pointer-events:none}
        .c1{width:420px;height:420px;background:#4fc3f7;top:-100px;left:-100px}
        .c2{width:320px;height:320px;background:#26a69a;bottom:-80px;right:-80px;animation-delay:3s}
        .c3{width:260px;height:260px;background:#7e57c2;top:40%;left:55%;animation-delay:6s}
        @keyframes blob{0%,100%{transform:translate(0,0)}40%{transform:translate(24px,-24px)}70%{transform:translate(-14px,14px)}}

        /* PRE-CALL CARD */
        .vc-card{background:#fff;border-radius:24px;width:100%;max-width:480px;box-shadow:0 32px 80px rgba(0,0,0,.28);overflow:hidden;position:relative;z-index:1;animation:cardIn .5s cubic-bezier(.34,1.56,.64,1)}
        @keyframes cardIn{from{opacity:0;transform:translateY(48px) scale(.93)}to{opacity:1;transform:translateY(0) scale(1)}}

        .vc-header{background:linear-gradient(135deg,#0b3e71,#1565c0);padding:18px 22px;display:flex;align-items:center;gap:14px}
        .vc-back{background:rgba(255,255,255,.15);border:none;color:#fff;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:13px;transition:.2s;white-space:nowrap}
        .vc-back:hover{background:rgba(255,255,255,.28)}
        .vc-title-row{display:flex;align-items:center;gap:10px;color:#fff;font-size:26px}
        .vc-title-row div h2{font-size:17px;font-weight:700;margin:0}
        .vc-title-row div p{font-size:12px;opacity:.8;margin:2px 0 0}

        .vc-start{padding:44px 32px;text-align:center;animation:fadeUp .4s ease}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .vc-anim{position:relative;width:110px;height:110px;margin:0 auto 28px;display:flex;align-items:center;justify-content:center}
        .pr{position:absolute;width:100%;height:100%;border-radius:50%;border:3px solid rgba(11,62,113,.18);animation:pulse 2.4s ease-out infinite}
        .d1{animation-delay:.8s}.d2{animation-delay:1.6s}
        @keyframes pulse{0%{transform:scale(.55);opacity:1}100%{transform:scale(1.45);opacity:0}}
        .vc-emoji{font-size:50px;position:relative;z-index:1}
        .vc-start h3{font-size:21px;color:#0b3e71;margin-bottom:10px;font-weight:700}
        .vc-start p{color:#666;font-size:14px;line-height:1.7;margin-bottom:28px}
        .vc-btn-start{background:linear-gradient(135deg,#0b3e71,#1565c0);color:#fff;border:none;padding:15px 44px;border-radius:50px;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 8px 24px rgba(11,62,113,.35);transition:.25s;display:inline-flex;align-items:center;gap:8px;min-width:220px;justify-content:center}
        .vc-btn-start:hover:not(:disabled){transform:translateY(-3px);box-shadow:0 14px 32px rgba(11,62,113,.45)}
        .vc-btn-start:disabled{opacity:.65;cursor:not-allowed}
        .spin{width:20px;height:20px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* ACTIVE CALL FULLSCREEN */
        .vc-fullscreen{position:fixed;inset:0;display:flex;flex-direction:column;background:#1a1a2e;z-index:999;animation:fadeUp .3s ease}

        .vc-topbar{display:flex;justify-content:space-between;align-items:center;padding:10px 20px;background:linear-gradient(90deg,#0b3e71,#1565c0);flex-shrink:0;gap:12px;flex-wrap:wrap}
        .vc-topbar-left{display:flex;align-items:center;gap:10px}
        .live-dot{font-size:14px;animation:livePulse 1.5s ease-in-out infinite}
        @keyframes livePulse{0%,100%{opacity:1}50%{opacity:.4}}
        .live-label{background:#e53935;color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:1px}
        .vc-room-name{color:#fff;font-size:14px;font-weight:600;opacity:.9}
        .vc-topbar-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .copy-link-btn{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:13px;transition:.2s;white-space:nowrap}
        .copy-link-btn:hover{background:rgba(255,255,255,.25)}
        .open-tab-btn{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:13px;text-decoration:none;transition:.2s;white-space:nowrap}
        .open-tab-btn:hover{background:rgba(255,255,255,.25)}
        .end-btn{background:linear-gradient(135deg,#c62828,#e53935);border:none;color:#fff;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;transition:.2s;white-space:nowrap;box-shadow:0 4px 12px rgba(198,40,40,.4)}
        .end-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(198,40,40,.5)}

        .jitsi-container{flex:1;width:100%;min-height:0}
        .jitsi-container iframe{width:100%;height:100%;border:none}

        @media(max-width:480px){
          .vc-topbar{padding:8px 12px}
          .vc-room-name{display:none}
          .open-tab-btn{display:none}
        }
      `}</style>
    </>
  );
}

export default VideoCall;
