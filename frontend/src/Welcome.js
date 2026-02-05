
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-wrapper">
      <div className="welcome-card">

        {/* LEFT */}
        <div className="welcome-left">
          <h1>ChatSphere 💬</h1>
          <p>
            Connect. Chat. Collaborate.  
            <br />
            Your smart conversation assistant.
          </p>

          <div className="btn-group">
            <button
              className="btn login"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>

            <button
              className="btn register"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="welcome-right">
          <img
            src="https://illustrations.popsy.co/purple/chatting.svg"
            alt="chat"
          />
        </div>

      </div>
    </div>
  );
}

export default Welcome;
