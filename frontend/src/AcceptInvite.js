import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import squadUpLogo from "./squaduplogo.png";

function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); 
  const [message, setMessage] = useState("Verifying invitation...");

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/group/accept/${token}`
        );

        if (res.data.status === "NOT_REGISTERED") {
          setStatus("info");
          setMessage("You need to register first to join this group.");

          setTimeout(() => {
            navigate("/register", {
              state: {
                email: res.data.email,
                groupId: res.data.groupId,
              },
            });
          }, 2000);
          return;
        }

        if (res.data.status === "ACCEPTED") {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));

          setStatus("success");
          setMessage("Successfully joined the group 🎉");

          setTimeout(() => {
            navigate(`/group/${res.data.groupId}`);
          }, 2000);
        }

      } catch (err) {
        setStatus("error");
        setMessage("Invite link is invalid or expired ❌");

        setTimeout(() => {
          navigate("/login");
        }, 2500);
      }
    };

    if (token) acceptInvite();
  }, [token, navigate]);

  return (
    <>
      <div className="invite-wrapper">
        <div className="invite-card">

          <img src={squadUpLogo} alt="logo" className="logo" />

          <h2>SquadUp</h2>

          {status === "loading" && (
            <div className="loader"></div>
          )}

          <p className={`message ${status}`}>
            {message}
          </p>

        </div>
      </div>

      {/* ================= CSS ================= */}
      <style>{`

        * {
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        .invite-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg,#0b3e71,#145da0);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .invite-card {
          background: white;
          padding: 50px 40px;
          border-radius: 20px;
          text-align: center;
          width: 420px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.2);
        }

        .logo {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          margin-bottom: 15px;
        }

        h2 {
          margin-bottom: 20px;
          color: #0b3e71;
        }

        .loader {
          border: 5px solid #f3f3f3;
          border-top: 5px solid #0b3e71;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          margin: 20px auto;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .message {
          margin-top: 20px;
          font-size: 16px;
          font-weight: 500;
        }

        .message.success {
          color: #28a745;
        }

        .message.error {
          color: #dc3545;
        }

        .message.info {
          color: #0b3e71;
        }

      `}</style>
    </>
  );
}

export default AcceptInvite;
