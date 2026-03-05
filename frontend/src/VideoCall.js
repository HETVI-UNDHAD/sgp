import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "./socket";
import { API_URL } from "./config";

function VideoCall() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [group, setGroup] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // Fetch group details
    axios.get(`${API_URL}/api/group/${groupId}`)
      .then(res => setGroup(res.data))
      .catch(err => console.error(err));

    // Listen for call notifications
    socket.on("callStarted", (data) => {
      if (data.groupId === groupId && data.initiatorEmail !== user.email) {
        const join = window.confirm(`${data.initiatorName} started a video call!\n\nMeeting Code: ${data.meetingCode}\n\nClick OK to join now`);
        if (join) {
          window.open(data.meetingLink, "_blank");
        }
      }
    });

    socket.on("callEnded", (data) => {
      if (data.meetingCode === meetingCode) {
        alert("Call has ended");
        setCallActive(false);
        setMeetingCode("");
      }
    });

    return () => {
      socket.off("callStarted");
      socket.off("callEnded");
    };
  }, [groupId, meetingCode, user.email]);

  const startCall = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/call/start`, {
        groupId,
        initiatorEmail: user.email,
        initiatorName: user.fullName || user.email
      });

      setMeetingCode(res.data.meetingCode);
      setMeetingLink(res.data.meetingLink);
      setCallActive(true);
      setParticipants([user.email]);
      
      alert("Meeting invitations sent to all group members via email!");
    } catch (err) {
      alert("Failed to start call");
    }
  };

  const endCall = async () => {
    try {
      await axios.post(`${API_URL}/api/call/end`, {
        meetingCode,
        groupId
      });

      setCallActive(false);
      setMeetingCode("");
      setMeetingLink("");
      setParticipants([]);
    } catch (err) {
      alert("Failed to end call");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(meetingCode);
    alert("Meeting code copied!");
  };

  return (
    <>
      <div className="video-call-wrapper">
        <div className="video-call-card">
          <h2>Video Call - {group?.name || "Group"}</h2>

          {!callActive ? (
            <div className="start-section">
              <p>Start a video call with your group members</p>
              <button onClick={startCall} className="start-btn">
                📹 Start Video Call
              </button>
              <button onClick={() => navigate(`/group/${groupId}`)} className="back-btn">
                ← Back to Group
              </button>
            </div>
          ) : (
            <div className="active-call">
              <div className="meeting-info">
                <h3>Meeting Code</h3>
                <div className="code-display">
                  <span className="code">{meetingCode}</span>
                  <button onClick={copyCode} className="copy-btn">📋 Copy</button>
                </div>
                <p className="instruction">Share this code with group members to join</p>
              </div>

              <div className="call-actions">
                <a 
                  href={meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="join-btn"
                >
                  🎥 Join Meeting
                </a>
                <button onClick={endCall} className="end-btn">
                  ❌ End Call
                </button>
              </div>

              <div className="email-notice">
                <p>✅ Email invitations sent to all group members</p>
              </div>

              <div className="participants">
                <h4>Participants ({participants.length})</h4>
                <ul>
                  {participants.map((email, idx) => (
                    <li key={idx}>{email}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        .video-call-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #0b3e71, #1f5fa3);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .video-call-card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        h2 {
          color: #0b3e71;
          margin-bottom: 30px;
          text-align: center;
        }

        .start-section {
          text-align: center;
        }

        .start-section p {
          margin-bottom: 20px;
          color: #666;
        }

        .start-btn {
          background: #0b3e71;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 10px;
          font-size: 16px;
          cursor: pointer;
          margin-bottom: 15px;
          width: 100%;
        }

        .start-btn:hover {
          background: #145da0;
        }

        .back-btn {
          background: #f0f0f0;
          color: #333;
          border: none;
          padding: 12px 25px;
          border-radius: 10px;
          cursor: pointer;
          width: 100%;
        }

        .active-call {
          text-align: center;
        }

        .meeting-info {
          background: #f4f8ff;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 25px;
        }

        .meeting-info h3 {
          color: #0b3e71;
          margin-bottom: 15px;
        }

        .code-display {
          display: flex;
          gap: 10px;
          justify-content: center;
          align-items: center;
          margin-bottom: 10px;
        }

        .code {
          font-size: 32px;
          font-weight: 700;
          color: #0b3e71;
          letter-spacing: 4px;
        }

        .copy-btn {
          background: #0b3e71;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .instruction {
          color: #666;
          font-size: 14px;
        }

        .call-actions {
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
        }

        .join-btn {
          flex: 1;
          background: #34a853;
          color: white;
          text-decoration: none;
          padding: 15px;
          border-radius: 10px;
          font-weight: 600;
          display: block;
          text-align: center;
        }

        .join-btn:hover {
          background: #2d8e47;
        }

        .end-btn {
          flex: 1;
          background: #dc3545;
          color: white;
          border: none;
          padding: 15px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        .end-btn:hover {
          background: #c82333;
        }

        .participants {
          background: #f4f8ff;
          padding: 20px;
          border-radius: 12px;
        }

        .participants h4 {
          color: #0b3e71;
          margin-bottom: 15px;
        }

        .participants ul {
          list-style: none;
          padding: 0;
        }

        .participants li {
          padding: 8px;
          background: white;
          margin-bottom: 8px;
          border-radius: 6px;
        }

        .email-notice {
          background: #d4edda;
          color: #155724;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          border: 1px solid #c3e6cb;
        }

        .email-notice p {
          margin: 0;
          font-weight: 500;
        }
      `}</style>
    </>
  );
}

export default VideoCall;
