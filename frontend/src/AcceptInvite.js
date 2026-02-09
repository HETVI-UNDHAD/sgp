import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/group/accept/${token}`
        );

        // 🟡 NOT REGISTERED → REGISTER PAGE
        if (res.data.status === "NOT_REGISTERED") {
          alert("Please register first to join the group");
          navigate("/register", {
            state: {
              email: res.data.email,
              groupId: res.data.groupId,
            },
          });
          return;
        }

        // 🟢 REGISTERED → AUTO LOGIN
        if (res.data.status === "ACCEPTED") {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));

          alert("Joined group successfully 🎉");
          navigate(`/group/${res.data.groupId}`);
        }
      } catch (err) {
        alert("Invite link invalid or expired ❌");
        navigate("/login");
      }
    };

    if (token) acceptInvite();
  }, [token, navigate]);

  return <h2>Joining group...</h2>;
}

export default AcceptInvite;
