import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function AcceptInvite() {
  const { token } = useParams(); // only token
  const navigate = useNavigate();

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/group/accept/${token}`
        );

        // 🟡 CASE 1: User not registered
        if (res.data.status === "NOT_REGISTERED") {
          alert("Please register first to join the group");
          navigate("/register", {
            state: { email: res.data.email },
          });
        }

        // 🟢 CASE 2: User registered & joined group
        if (res.data.status === "JOINED") {
          alert("You have joined the group 🎉");
          navigate("/login");
        }
      } catch (err) {
        console.error(err);
        alert("Invite link is invalid or expired ❌");
        navigate("/login");
      }
    };

    if (token) {
      acceptInvite();
    }
  }, [token, navigate]);

  return <h2>Joining group...</h2>;
}

export default AcceptInvite;
