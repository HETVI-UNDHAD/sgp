import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import squadUpLogo from "./squaduplogo.png";

function AddMembers() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Add email when press Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const email = emailInput.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        setMessage("Invalid email format ❌");
        return;
      }

      if (emails.includes(email)) {
        setMessage("Email already added ⚠️");
        return;
      }

      setEmails([...emails, email]);
      setEmailInput("");
      setMessage("");
    }
  };

  const removeEmail = (remove) => {
    setEmails(emails.filter((e) => e !== remove));
  };

  const sendInvite = async () => {
    if (emails.length === 0) {
      setMessage("Please add at least one email ❗");
      return;
    }

    try {
      setLoading(true);

      for (let email of emails) {
        await axios.post("http://localhost:5000/api/group/invite", {
          email,
          groupId,
        });
      }

      setMessage("Invitations sent successfully ✅");
      setEmails([]);

      setTimeout(() => {
        navigate(`/group/${groupId}`);
      }, 1200);

    } catch (err) {
      setMessage("Error sending invites ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-wrapper">
        <div className="auth-card">

          {/* LEFT PANEL */}
          <div className="left-panel">
            <div className="brand-box">
              <img src={squadUpLogo} alt="logo" />
              <h2>SquadUp</h2>
              <p>Level Up Your Squad 🚀</p>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="right-panel">
            <h1>Add Members</h1>
            <p className="subtitle">
              Type email and press <b>Enter</b> to add
            </p>

            <div className="count-box">
              Total Emails Added: <span>{emails.length}</span>
            </div>

            <div className="email-container">
              {emails.map((email, index) => (
                <div key={index} className="email-tag">
                  {email}
                  <span onClick={() => removeEmail(email)}>×</span>
                </div>
              ))}

              <input
                type="text"
                placeholder="Enter email and press Enter"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {message && <p className="message">{message}</p>}

            <button
              className="primary-btn"
              onClick={sendInvite}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Invitations →"}
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>
          </div>

        </div>
      </div>

      {/* ================= CSS ================= */}
      <style>{`

        * {
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        body {
          margin: 0;
        }

        /* WRAPPER */
        .auth-wrapper {
          min-height: 100vh;
          background: #eef2f7;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
        }

        /* CARD */
        .auth-card {
          width: 1000px;
          height: 600px;
          display: flex;
          background: #f8f9fb;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.1);
        }

        /* LEFT PANEL */
        .left-panel {
          width: 45%;
          background: linear-gradient(135deg,#0b3e71,#145da0);
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          text-align: center;
          padding: 40px;
        }

        .brand-box img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  background: white;
  padding: 15px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.25);
  margin-bottom: 20px;
}


        .brand-box h2 {
          font-size: 32px;
          margin-bottom: 10px;
        }

        .brand-box p {
          opacity: 0.9;
        }

        /* RIGHT PANEL */
        .right-panel {
          width: 55%;
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .right-panel h1 {
          color: #1c1c1c;
          margin-bottom: 10px;
        }

        .subtitle {
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
        }

        /* COUNT BOX */
        .count-box {
          background: #e3ecfa;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        /* EMAIL INPUT AREA */
        .email-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 14px;
          border: 1px solid #ddd;
          border-radius: 12px;
          min-height: 60px;
          background: white;
          margin-bottom: 15px;
        }

        .email-container input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 14px;
        }

        /* EMAIL TAG */
        .email-tag {
  background: white;
  color: #0b3e71;
  padding: 8px 14px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  border: 2px solid #0b3e71;
  font-weight: 500;
}


       .email-tag span {
  cursor: pointer;
  font-weight: bold;
  color: #0b3e71;
}
.email-tag:hover {
  background: #f1f6ff;
}


        /* PRIMARY BUTTON */
        .primary-btn {
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: #0b3e71;
          color: white;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 15px;
          transition: 0.3s;
        }

        .primary-btn:hover {
          background: #145da0;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(11,62,113,0.3);
        }

        /* SECONDARY BUTTON */
        .secondary-btn {
          padding: 12px;
          border-radius: 12px;
          border: 2px solid #0b3e71;
          background: white;
          color: #0b3e71;
          font-weight: 500;
          cursor: pointer;
        }

        /* MESSAGE */
        .message {
          font-size: 14px;
          margin-bottom: 10px;
          color: #d9534f;
        }

      `}</style>
    </>
  );
}

export default AddMembers;
