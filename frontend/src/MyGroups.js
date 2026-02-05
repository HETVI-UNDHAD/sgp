import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MyGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // 🔒 If user not logged in
    if (!user || !user._id) {
      navigate("/login");
      return;
    }

    const fetchGroups = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/group/user/${user._id}`
        );
        setGroups(res.data);
      } catch (err) {
        console.error("FETCH GROUP ERROR ❌", err);
        alert("Failed to load groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user?._id, navigate]);

  if (loading) {
    return <h3 style={{ textAlign: "center" }}>Loading groups...</h3>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>My Groups</h2>

      {groups.length === 0 && (
        <p style={{ color: "#777" }}>No groups joined yet</p>
      )}

      {groups.map((g) => (
        <div
          key={g._id}
          style={{
            border: "1px solid #ccc",
            marginBottom: 15,
            padding: 15,
            borderRadius: 8,
          }}
        >
          <h3>{g.name}</h3>

          <p>
            <b>Admin:</b> {g.adminEmail}
          </p>

          <p>
            <b>Total Members:</b> {g.memberCount}
          </p>

          <details>
            <summary>Show member emails</summary>
            <ul>
              {g.memberEmails.map((email, i) => (
                <li key={i}>{email}</li>
              ))}
            </ul>
          </details>

          <button
            style={{ marginTop: 10 }}
            onClick={() => navigate(`/group/${g._id}`)}
          >
            Open Group
          </button>
        </div>
      ))}
    </div>
  );
}

export default MyGroups;
