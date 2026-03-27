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
  const [meetingName, setMeetingName] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [timeLeft, setTimeLeft] = useState(0);
  const [toast, setToast] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef(null);
  const jitsiRef = useRef(null);
  const apiRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    axios.get(`${API_URL}/api/group/${groupId}`).then(res => setGroup(res.data)).catch(console.error);

    socket.on("callStarted", (data) => {
      if (data.groupId === groupId && data.initiatorEmail !== user.email) {
        setIncomingCall(data);
      }
    });

    socket.on("callEnded", () => {
      clearInterval(timerRef.current);
      setCallActive(false); setRoomName(""); setMeetingLink(""); setTimeLeft(0);
      setCallEnded(true);
    });

    return () => { socket.off("callStarted"); socket.off("callEnded"); };
  }, [groupId, user.email]);

  useEffect(() => {
    if (document.getElementById("jitsi-script")) return;
    const script = document.createElement("script");
    script.id = "jitsi-script";
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

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
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_BUTTONS: ["microphone","camera","hangup","chat","tileview","fullscreen","settings"],
        },
      });

      apiRef.current.addEventListener("readyToClose", () => endCall());
    };

    tryInit();
    return () => { if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; } };
  }, [callActive, roomName]);

  const startCall = async () => {
    if (!meetingName.trim()) return showToast("Please enter a meeting name", "error");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/call/start`, {
        groupId, initiatorEmail: user.email, initiatorName: user.fullName || user.email,
        meetingName: meetingName.trim(), timeLimit: Number(timeLimit),
      });
      setRoomName(res.data.meetingCode);
      setMeetingLink(res.data.meetingLink);
      setCallActive(true);
      const seconds = Number(timeLimit) * 60;
      setTimeLeft(seconds);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); endCall(); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      showToast("Failed to start call. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const endCall = async () => {
    clearInterval(timerRef.current);
    setConfirmEnd(false);
    const elapsed = Number(timeLimit) * 60 - timeLeft;
    setCallDuration(elapsed > 0 ? elapsed : Number(timeLimit) * 60);
    try {
      if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; }
      await axios.post(`${API_URL}/api/call/end`, { meetingCode: roomName, groupId });
    } catch {}
    setCallActive(false); setRoomName(""); setMeetingLink(""); setTimeLeft(0);
    setCallEnded(true);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("Meeting link copied!", "success");
  };

  return (
    <>
      <div className="vc-page">
        <div className="vc-bg c1"/><div className="vc-bg c2"/><div className="vc-bg c3"/>

        {callEnded ? (
          <div className="vc-card">
            <div className="vc-header">
              <button className="vc-back" onClick={() => navigate(`/messages/${groupId}`)}>← Back to Chat</button>
              <div className="vc-title-row">
                <div className="vc-header-icon">📹</div>
                <div>
                  <h2>{group?.groupName || "Group"}</h2>
                  <p>👥 {group?.memberCount || 0} members</p>
                </div>
              </div>
            </div>
            <div className="vc-body">
              <div className="ended-icon-wrap">
                <div className="ended-icon">📵</div>
              </div>
              <h3>Call Ended</h3>
              <p>Your meeting has ended.</p>
              <div className="ended-stats">
                <div className="ended-stat">
                  <span className="ended-stat-label">Duration</span>
                  <span className="ended-stat-value">{formatTime(callDuration)}</span>
                </div>
                <div className="ended-stat">
                  <span className="ended-stat-label">Meeting</span>
                  <span className="ended-stat-value">{meetingName || "—"}</span>
                </div>
                <div className="ended-stat">
                  <span className="ended-stat-label">Participants</span>
                  <span className="ended-stat-value">{group?.memberCount || 0}</span>
                </div>
              </div>
              <div className="ended-actions">
                <button className="vc-btn-secondary" onClick={() => { setCallEnded(false); setMeetingName(""); setTimeLimit(30); }}>
                  🔄 Start New Call
                </button>
                <button className="vc-btn-start" style={{maxWidth:"100%"}} onClick={() => navigate(`/messages/${groupId}`)}>
                  💬 Back to Chat
                </button>
              </div>
            </div>
          </div>
        ) : !callActive ? (
          <div className="vc-card">
            <div className="vc-header">
              <button className="vc-back" onClick={() => navigate(`/messages/${groupId}`)}>← Back</button>
              <div className="vc-title-row">
                <div className="vc-header-icon">📹</div>
                <div>
                  <h2>{group?.groupName || "Group"}</h2>
                  <p>👥 {group?.memberCount || 0} members</p>
                </div>
              </div>
            </div>

            <div className="vc-body">
              <div className="vc-anim-wrap">
                <div className="vc-ring r1"/><div className="vc-ring r2"/><div className="vc-ring r3"/>
                <div className="vc-icon-circle">🎥</div>
              </div>

              <h3>Start a Video Meeting</h3>
              <p>Powered by <strong>Jitsi Meet</strong> — free &amp; no account needed.<br/>All group members will be notified instantly.</p>

              <div className="vc-form">
                <div className="vc-field">
                  <label>Meeting Name</label>
                  <input
                    className="vc-input"
                    placeholder="e.g. Weekly Standup"
                    value={meetingName}
                    onChange={e => setMeetingName(e.target.value)}
                    maxLength={60}
                  />
                </div>
                <div className="vc-field">
                  <label>Time Limit (minutes)</label>
                  <div className="vc-time-row">
                    {[15, 30, 45, 60, 90, 120].map(t => (
                      <button key={t} type="button"
                        className={`vc-time-chip ${timeLimit === t ? "active" : ""}`}
                        onClick={() => setTimeLimit(t)}
                      >{t}m</button>
                    ))}
                    <input
                      className="vc-input vc-custom-time"
                      type="number" min="1" max="480"
                      placeholder="Custom"
                      onChange={e => setTimeLimit(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

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
                <span className="vc-room-name">{meetingName || group?.groupName || "Meeting"}</span>
              </div>
              <div className="vc-topbar-center">
                {timeLeft > 0 && (
                  <span className={`vc-timer ${timeLeft <= 60 ? "vc-timer-warn" : ""}`}>
                    ⏱ {formatTime(timeLeft)}
                  </span>
                )}
              </div>
              <div className="vc-topbar-right">
                <button className="copy-link-btn" onClick={copyLink}>
                  {copied ? "✅ Copied!" : "🔗 Copy Link"}
                </button>
                <a href={meetingLink} target="_blank" rel="noopener noreferrer" className="open-tab-btn">↗ Open in Tab</a>
                <button className="end-btn" onClick={() => setConfirmEnd(true)}>📵 End Call</button>
              </div>
            </div>
            <div className="jitsi-container" ref={jitsiRef} />
          </div>
        )
        }

        {/* ── INCOMING CALL MODAL ── */}
        {incomingCall && (
          <div className="vc-modal-overlay">
            <div className="vc-modal incoming-modal">
              <div className="incoming-icon">📹</div>
              <h3>Incoming Video Call</h3>
              <p><strong>{incomingCall.initiatorName}</strong> started a video call in <strong>{group?.groupName}</strong></p>
              <div className="vc-modal-actions">
                <button className="vc-modal-decline" onClick={() => setIncomingCall(null)}>Decline</button>
                <button className="vc-modal-join" onClick={() => { window.open(incomingCall.meetingLink, "_blank"); setIncomingCall(null); }}>
                  Join Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── END CALL CONFIRM MODAL ── */}
        {confirmEnd && (
          <div className="vc-modal-overlay">
            <div className="vc-modal">
              <div className="incoming-icon">📵</div>
              <h3>End Call?</h3>
              <p>This will end the call for everyone in the meeting.</p>
              <div className="vc-modal-actions">
                <button className="vc-modal-decline" onClick={() => setConfirmEnd(false)}>Cancel</button>
                <button className="vc-modal-end" onClick={endCall}>End for Everyone</button>
              </div>
            </div>
          </div>
        )}

        {/* ── TOAST ── */}
        {toast && (
          <div className={`vc-toast vc-toast-${toast.type}`}>
            <span>{toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}</span>
            <span>{toast.msg}</span>
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

        .vc-card{
          background:rgba(255,255,255,.04);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
          border:1px solid rgba(255,255,255,.1);border-radius:28px;
          width:100%;max-width:520px;
          box-shadow:0 40px 100px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.05);
          overflow:hidden;position:relative;z-index:1;
          animation:cardIn .5s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes cardIn{from{opacity:0;transform:translateY(50px) scale(.92)}to{opacity:1;transform:translateY(0) scale(1)}}

        .vc-header{
          background:linear-gradient(135deg,rgba(59,130,246,.3),rgba(139,92,246,.3));
          border-bottom:1px solid rgba(255,255,255,.08);
          padding:20px 24px;display:flex;align-items:center;gap:16px;
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

        .vc-body{padding:40px 36px;text-align:center}
        .vc-anim-wrap{position:relative;width:120px;height:120px;margin:0 auto 32px;display:flex;align-items:center;justify-content:center}
        .vc-ring{position:absolute;border-radius:50%;border:2px solid rgba(99,179,237,.25);animation:ringPulse 2.8s ease-out infinite}
        .r1{width:120px;height:120px}.r2{width:120px;height:120px;animation-delay:.9s}.r3{width:120px;height:120px;animation-delay:1.8s}
        @keyframes ringPulse{0%{transform:scale(.5);opacity:.8}100%{transform:scale(1.6);opacity:0}}
        .vc-icon-circle{
          width:72px;height:72px;border-radius:50%;
          background:linear-gradient(135deg,#3b82f6,#8b5cf6);
          display:flex;align-items:center;justify-content:center;
          font-size:32px;position:relative;z-index:1;
          box-shadow:0 8px 32px rgba(59,130,246,.4);
        }
        .vc-body h3{font-size:22px;font-weight:700;color:#fff;margin-bottom:10px}
        .vc-body p{color:rgba(255,255,255,.55);font-size:14px;line-height:1.75;margin-bottom:24px}
        .vc-body p strong{color:rgba(255,255,255,.8)}

        /* CALL ENDED SCREEN */
        .ended-icon-wrap{margin:0 auto 28px;width:90px;height:90px;border-radius:50%;background:rgba(239,68,68,.12);border:2px solid rgba(239,68,68,.25);display:flex;align-items:center;justify-content:center;animation:cardIn .4s ease}
        .ended-icon{font-size:40px}
        .ended-stats{display:flex;gap:12px;margin-bottom:28px;justify-content:center;flex-wrap:wrap}
        .ended-stat{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px 20px;min-width:100px;text-align:center}
        .ended-stat-label{display:block;font-size:11px;color:#64748b;font-weight:500;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
        .ended-stat-value{display:block;font-size:16px;font-weight:700;color:#f1f5f9}
        .ended-actions{display:flex;flex-direction:column;gap:12px;align-items:center}
        .vc-btn-secondary{
          background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);
          color:#f1f5f9;padding:14px 48px;border-radius:50px;
          font-size:15px;font-weight:600;cursor:pointer;width:100%;max-width:320px;
          transition:.25s;display:inline-flex;align-items:center;justify-content:center;gap:8px;
        }
        .vc-btn-secondary:hover{background:rgba(255,255,255,.1);transform:translateY(-2px)}

        .vc-form{width:100%;text-align:left;margin-bottom:20px;display:flex;flex-direction:column;gap:16px}
        .vc-field{display:flex;flex-direction:column;gap:6px}
        .vc-field label{font-size:13px;font-weight:600;color:rgba(255,255,255,.7)}
        .vc-input{
          width:100%;padding:10px 14px;
          background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.12);
          border-radius:10px;font-size:14px;color:#fff;
          outline:none;transition:border-color .2s;box-sizing:border-box;
        }
        .vc-input::placeholder{color:rgba(255,255,255,.3)}
        .vc-input:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.2)}
        .vc-time-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
        .vc-time-chip{
          padding:6px 14px;border:1.5px solid rgba(255,255,255,.15);
          border-radius:20px;background:rgba(255,255,255,.06);
          color:rgba(255,255,255,.7);font-size:13px;font-weight:600;cursor:pointer;transition:.2s;
        }
        .vc-time-chip:hover{border-color:#3b82f6;background:rgba(59,130,246,.15)}
        .vc-time-chip.active{background:#3b82f6;color:#fff;border-color:#3b82f6}
        .vc-custom-time{width:90px;padding:6px 10px;font-size:13px}

        .vc-chips{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:24px}
        .chip{
          background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
          color:rgba(255,255,255,.7);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:500;
        }

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
          padding:12px 20px;background:rgba(10,10,26,.95);
          border-bottom:1px solid rgba(255,255,255,.08);
          backdrop-filter:blur(12px);flex-shrink:0;gap:12px;flex-wrap:wrap;
        }
        .vc-topbar-left{display:flex;align-items:center;gap:12px}
        .vc-topbar-center{flex:1;display:flex;justify-content:center}
        .vc-topbar-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .live-badge{
          background:linear-gradient(135deg,#dc2626,#ef4444);
          color:#fff;font-size:11px;font-weight:700;
          padding:4px 12px;border-radius:20px;letter-spacing:.8px;
          box-shadow:0 0 12px rgba(239,68,68,.4);
          animation:livePulse 1.8s ease-in-out infinite;
        }
        @keyframes livePulse{0%,100%{box-shadow:0 0 12px rgba(239,68,68,.4)}50%{box-shadow:0 0 20px rgba(239,68,68,.7)}}
        .vc-room-name{color:rgba(255,255,255,.85);font-size:14px;font-weight:600}
        .vc-timer{background:rgba(255,255,255,.15);color:#fff;font-size:15px;font-weight:700;padding:6px 16px;border-radius:20px;letter-spacing:1px;border:1px solid rgba(255,255,255,.25)}
        .vc-timer-warn{background:rgba(229,57,53,.7);border-color:#e53935;animation:timerPulse 1s ease-in-out infinite}
        @keyframes timerPulse{0%,100%{opacity:1}50%{opacity:.6}}
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
          transition:.2s;white-space:nowrap;box-shadow:0 4px 14px rgba(185,28,28,.45);
        }
        .end-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(185,28,28,.6)}
        .jitsi-container{flex:1;width:100%;min-height:0}
        .jitsi-container iframe{width:100%;height:100%;border:none}

        /* MODALS */
        .vc-modal-overlay{
          position:fixed;inset:0;background:rgba(0,0,0,.75);
          display:flex;align-items:center;justify-content:center;
          z-index:2000;backdrop-filter:blur(6px);
          animation:fadeIn .2s ease;
        }
        .vc-modal{
          background:#1a1a2e;border:1px solid rgba(255,255,255,.1);
          border-radius:20px;padding:36px 32px;
          max-width:380px;width:90%;text-align:center;
          box-shadow:0 24px 60px rgba(0,0,0,.6);
          animation:cardIn .3s cubic-bezier(.34,1.56,.64,1);
        }
        .incoming-modal{border-color:rgba(59,130,246,.3);box-shadow:0 24px 60px rgba(0,0,0,.6),0 0 0 1px rgba(59,130,246,.15)}
        .incoming-icon{font-size:48px;margin-bottom:16px;animation:ringPulse 1.5s ease-in-out infinite}
        .vc-modal h3{font-size:20px;font-weight:700;color:#f1f5f9;margin-bottom:10px}
        .vc-modal p{font-size:14px;color:#94a3b8;line-height:1.6;margin-bottom:24px}
        .vc-modal p strong{color:#f1f5f9}
        .vc-modal-actions{display:flex;gap:12px}
        .vc-modal-decline{
          flex:1;padding:12px;border-radius:10px;
          background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
          color:#94a3b8;font-size:14px;font-weight:600;cursor:pointer;transition:.2s;
        }
        .vc-modal-decline:hover{background:rgba(255,255,255,.1);color:#f1f5f9}
        .vc-modal-join{
          flex:1;padding:12px;border-radius:10px;
          background:linear-gradient(135deg,#3b82f6,#8b5cf6);
          border:none;color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:.2s;
          box-shadow:0 4px 15px rgba(59,130,246,.4);
        }
        .vc-modal-join:hover{opacity:.9;transform:translateY(-1px)}
        .vc-modal-end{
          flex:1;padding:12px;border-radius:10px;
          background:linear-gradient(135deg,#b91c1c,#ef4444);
          border:none;color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:.2s;
          box-shadow:0 4px 15px rgba(185,28,28,.4);
        }
        .vc-modal-end:hover{opacity:.9;transform:translateY(-1px)}

        /* TOAST */
        .vc-toast{
          position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
          display:flex;align-items:center;gap:10px;
          padding:12px 20px;border-radius:12px;
          font-size:14px;font-weight:500;color:#f1f5f9;
          box-shadow:0 8px 30px rgba(0,0,0,.5);
          z-index:3000;animation:toastIn .3s ease;
          backdrop-filter:blur(12px);white-space:nowrap;
        }
        .vc-toast-success{background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3)}
        .vc-toast-error{background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3)}
        .vc-toast-info{background:rgba(59,130,246,.15);border:1px solid rgba(59,130,246,.3)}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

        @media(max-width:480px){
          .vc-body{padding:32px 20px}
          .vc-topbar{padding:8px 12px}
          .vc-room-name,.open-tab-btn{display:none}
        }
      `}</style>
    </>
  );
}

export default VideoCall;
