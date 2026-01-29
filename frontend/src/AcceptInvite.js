import { useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function AcceptInvite() {
  const { token } = useParams(); // ✅ ONLY token

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/group/accept/${token}`
        );

        alert("You have joined the group 🎉");
        console.log(res.data);

        // redirect after success
        window.location.href = "/dashboard";
      } catch (err) {
        console.error(err);
        alert("Invite link is invalid or expired ❌");
      }
    };

    if (token) {
      acceptInvite();
    }
  }, [token]);

  return <h2>Joining group...</h2>;
}

export default AcceptInvite;
