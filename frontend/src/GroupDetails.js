import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const fetchGroup = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/group/${groupId}`
        );
        setGroup(res.data);
      } catch (err) {
        console.error("GROUP FETCH ERROR ❌", err);
        alert("Failed to load group");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, navigate]);

  if (loading) return <h3 style={styles.center}>Loading group...</h3>;
  if (!group) return <h3 style={styles.center}>Group not found</h3>;

  return (
    <div style={styles.card}>
      <h2>📌 Group: {group.groupName}</h2>

      <p>
        <b>Admin:</b> {group.adminEmail}
      </p>

      <p>
        <b>Total Members:</b> {group.memberCount}
      </p>

      <button
        onClick={() => setShowMembers(!showMembers)}
        style={styles.button}
      >
        {showMembers ? "Hide Members" : "Show Members"}
      </button>

      {showMembers && (
        <ul style={styles.list}>
          {group.memberEmails.length === 0 ? (
            <li>No members yet</li>
          ) : (
            group.memberEmails.map((email, index) => (
              <li key={index}>{email}</li>
            ))
          )}
        </ul>
      )}

      <button
        style={{ ...styles.button, background: "#ddd", marginTop: "15px" }}
        onClick={() => navigate("/dashboard")}
      >
        ⬅ Back to Dashboard
      </button>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  card: {
    maxWidth: "500px",
    margin: "40px auto",
    padding: "25px",
    borderRadius: "12px",
    background: "#f9f9f9",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
  },
  button: {
    padding: "10px 16px",
    marginTop: "12px",
    cursor: "pointer",
    borderRadius: "6px",
    border: "none",
    background: "#007bff",
    color: "#fff",
    fontSize: "14px",
  },
  list: {
    marginTop: "15px",
    paddingLeft: "20px",
  },
  center: {
    textAlign: "center",
    marginTop: "40px",
  },
};

export default GroupDetails;
