import { useState } from "react";
import axios from "axios";

function AddMembers() {
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);

  const sendInvite = async () => {
    if (!emails.trim()) {
      alert("Please enter at least one email");
      return;
    }

    const groupId = localStorage.getItem("groupId");
    if (!groupId) {
      alert("Group not found. Please create group again.");
      return;
    }

    // split emails by comma
    const emailList = emails
      .split(",")
      .map(e => e.trim())
      .filter(e => e);

    if (emailList.length === 0) {
      alert("Invalid email format");
      return;
    }

    try {
      setLoading(true);

      for (let email of emailList) {
        await axios.post(
          "http://localhost:5000/api/group/invite",
          { email, groupId }
        );
      }

      alert("Invitations sent successfully ✅");
      setEmails("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error sending invite ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Add Members</h2>

        <p style={styles.note}>
          Enter email(s) separated by comma
        </p>

        <textarea
          placeholder="example1@gmail.com, example2@gmail.com"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          style={styles.textarea}
        />

        <button
          onClick={sendInvite}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Sending..." : "Send Invite"}
        </button>
      </div>
    </div>
  );
}

export default AddMembers;

/* ================= STYLES ================= */
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "360px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  note: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "8px",
  },
  textarea: {
    width: "100%",
    minHeight: "80px",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "none",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
};
