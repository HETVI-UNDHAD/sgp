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
        <div className="vc-bg c1"/><div className="vc-bg c2"/><div className="vc-bg c3"/>

        {!callActive ? (
          <div className="vc-card">
            {/* Header */}
            <div className="vc-header">
              <button className="vc-back" onClick={() => navigate(`/group/${groupId}`)}>← Back</button>
              <div className="vc-title-row">
                <div className="vc-header-icon">📹</div>
                <div>
                  <h2>{group?.groupName || "Group"}</h2>
                  <p>👥 {group?.memberCount || 0} members</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="vc-body">
              {/* Animated camera icon */}
              <div className="vc-anim-wrap">
                <div className="vc-ring r1"/>
                <div className="vc-ring r2"/>
                <div className="vc-ring r3"/>
                <div className="vc-icon-circle">🎥</div>
              </div>

              <h3>Start a Video Meeting</h3>
              <p>Powered by <strong>Jitsi Meet</strong> — free &amp; no account needed.<br/>All group members will be notified instantly.</p>

              {/* Info chips */}
              <div className="vc-chips">
                <span className="chip">🔒 Encrypted</span>
                <span className="chip">⚡ Instant</span>
                <span className="chip">📧 Auto Notify</span>
              </div>

              <button className="vc-btn-start" onClick={startCall} disabled={loading}>
                {loading ? <><span className="spin"/> Starting...</> : "📹 Create & Join Meeting"}
              </button>
            </div>
          </div>
        ) : (
          <div className="vc-fullscreen">
            <div className="vc-topbar">
              <div className="vc-topbar-left">
                <span className="live-badge">🔴 LIVE</span>
                <span className="vc-room-name">{group?.groupName || "Meeting"}</span>
              </div>
              <div className="vc-topbar-right">
                <button className="copy-link-btn" onClick={copyLink}>
                  {copied ? "✅ Copied!" : "🔗 Copy Link"}
                </button>
                <a href={meetingLink} target="_blank" rel="noopener noreferrer" className="open-tab-btn">↗ Open in Tab</a>
                <button className="end-btn" onClick={endCall}>📵 End Call</button>
              </div>
            </div>
            <div className="jitsi-container" ref={jitsiRef} />
          </div>
        )}
      </div>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;font-family:'Poppins',sans-serif}

        .vc-page{
          min-height:100vh;
          background:linear-gradient(135deg,#0a0a1a 0%,#0d1b3e 50%,#0a0a1a 100%);
          display:flex;align-items:center;justify-content:center;
          padding:20px;position:relative;overflow:hidden;
        }

        .vc-bg{position:absolute;border-radius:50%;filter:blur(80px);opacity:.15;animation:blob 10s ease-in-out infinite;pointer-events:none}
        .c1{width:500px;height:500px;background:#3b82f6;top:-150px;left:-150px}
        .c2{width:400px;height:400px;background:#8b5cf6;bottom:-100px;right:-100px;animation-delay:3.5s}
        .c3{width:300px;height:300px;background:#06b6d4;top:35%;left:50%;animation-delay:7s}
        @keyframes blob{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(30px,-30px) scale(1.05)}70%{transform:translate(-20px,20px) scale(.95)}}

        /* CARD */
        .vc-card{
          background:rgba(255,255,255,.04);
          backdrop-filter:blur(24px);
          -webkit-backdrop-filter:blur(24px);
          border:1px solid rgba(255,255,255,.1);
          border-radius:28px;
          width:100%;max-width:500px;
          box-shadow:0 40px 100px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.05);
          overflow:hidden;position:relative;z-index:1;
          animation:cardIn .5s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes cardIn{from{opacity:0;transform:translateY(50px) scale(.92)}to{opacity:1;transform:translateY(0) scale(1)}}

        /* HEADER */
        .vc-header{
          background:linear-gradient(135deg,rgba(59,130,246,.3),rgba(139,92,246,.3));
          border-bottom:1px solid rgba(255,255,255,.08);
          padding:20px 24px;
          display:flex;align-items:center;gap:16px;
        }
        .vc-back{
          background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);
          color:#fff;padding:8px 16px;border-radius:10px;cursor:pointer;
          font-size:13px;font-weight:500;transition:.2s;white-space:nowrap;
        }
        .vc-back:hover{background:rgba(255,255,255,.2);transform:translateX(-2px)}
        .vc-title-row{display:flex;align-items:center;gap:12px}
        .vc-header-icon{font-size:28px;line-height:1}
        .vc-title-row div h2{font-size:18px;font-weight:700;color:#fff;margin:0}
        .vc-title-row div p{font-size:12px;color:rgba(255,255,255,.55);margin:3px 0 0}

        /* BODY */
        .vc-body{padding:48px 36px;text-align:center}

        /* Animated icon */
        .vc-anim-wrap{position:relative;width:120px;height:120px;margin:0 auto 36px;display:flex;align-items:center;justify-content:center}
        .vc-ring{position:absolute;border-radius:50%;border:2px solid rgba(99,179,237,.25);animation:ringPulse 2.8s ease-out infinite}
        .r1{width:120px;height:120px}
        .r2{width:120px;height:120px;animation-delay:.9s}
        .r3{width:120px;height:120px;animation-delay:1.8s}
        @keyframes ringPulse{0%{transform:scale(.5);opacity:.8}100%{transform:scale(1.6);opacity:0}}
        .vc-icon-circle{
          width:72px;height:72px;border-radius:50%;
          background:linear-gradient(135deg,#3b82f6,#8b5cf6);
          display:flex;align-items:center;justify-content:center;
          font-size:32px;position:relative;z-index:1;
          box-shadow:0 8px 32px rgba(59,130,246,.4);
        }

        .vc-body h3{font-size:22px;font-weight:700;color:#fff;margin-bottom:12px}
        .vc-body p{color:rgba(255,255,255,.55);font-size:14px;line-height:1.75;margin-bottom:28px}
        .vc-body p strong{color:rgba(255,255,255,.8)}

        /* Chips */
        .vc-chips{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:32px}
        .chip{
          background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
          color:rgba(255,255,255,.7);padding:6px 14px;border-radius:20px;
          font-size:12px;font-weight:500;
        }

        /* Start button */
        .vc-btn-start{
          background:linear-gradient(135deg,#3b82f6,#8b5cf6);
          color:#fff;border:none;padding:16px 48px;
          border-radius:50px;font-size:16px;font-weight:600;
          cursor:pointer;width:100%;max-width:320px;
          box-shadow:0 8px 28px rgba(59,130,246,.4);
          transition:.25s;display:inline-flex;align-items:center;justify-content:center;gap:10px;
        }
        .vc-btn-start:hover:not(:disabled){transform:translateY(-3px);box-shadow:0 14px 36px rgba(59,130,246,.55)}
        .vc-btn-start:disabled{opacity:.6;cursor:not-allowed}
        .spin{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* FULLSCREEN CALL */
        .vc-fullscreen{position:fixed;inset:0;display:flex;flex-direction:column;background:#0a0a1a;z-index:999;animation:fadeIn .3s ease}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}

        .vc-topbar{
          display:flex;justify-content:space-between;align-items:center;
          padding:12px 20px;
          background:rgba(10,10,26,.95);
          border-bottom:1px solid rgba(255,255,255,.08);
          backdrop-filter:blur(12px);
          flex-shrink:0;gap:12px;flex-wrap:wrap;
        }
        .vc-topbar-left{display:flex;align-items:center;gap:12px}
        .live-badge{
          background:linear-gradient(135deg,#dc2626,#ef4444);
          color:#fff;font-size:11px;font-weight:700;
          padding:4px 12px;border-radius:20px;letter-spacing:.8px;
          box-shadow:0 0 12px rgba(239,68,68,.4);
          animation:livePulse 1.8s ease-in-out infinite;
        }
        @keyframes livePulse{0%,100%{box-shadow:0 0 12px rgba(239,68,68,.4)}50%{box-shadow:0 0 20px rgba(239,68,68,.7)}}
        .vc-room-name{color:rgba(255,255,255,.85);font-size:14px;font-weight:600}
        .vc-topbar-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .copy-link-btn,.open-tab-btn{
          background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);
          color:#fff;padding:7px 14px;border-radius:8px;
          cursor:pointer;font-size:12px;font-weight:500;
          text-decoration:none;transition:.2s;white-space:nowrap;
        }
        .copy-link-btn:hover,.open-tab-btn:hover{background:rgba(255,255,255,.16)}
        .end-btn{
          background:linear-gradient(135deg,#b91c1c,#ef4444);
          border:none;color:#fff;padding:8px 18px;
          border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;
          transition:.2s;white-space:nowrap;
          box-shadow:0 4px 14px rgba(185,28,28,.45);
        }
        .end-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(185,28,28,.6)}

        .jitsi-container{flex:1;width:100%;min-height:0}
        .jitsi-container iframe{width:100%;height:100%;border:none}

        @media(max-width:480px){
          .vc-body{padding:36px 24px}
          .vc-topbar{padding:8px 12px}
          .vc-room-name,.open-tab-btn{display:none}
        }
      `}</style>
    </>
  );
}

export default VideoCall;
