import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const navigate = useNavigate();

  const createGroup = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("User not logged in");
      navigate("/login");
      return;
    }

    if (!groupName.trim()) {
      alert("Group name is required");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/group/create",
        {
          groupName,
          adminId: user.id, // ✅ very important
        }
      );

      const groupId = res.data._id;

      // ✅ go to add-members WITH groupId
      navigate(`/add-members/${groupId}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error creating group");
    }
  };

  return (
    <div>
      <h2>Create Group</h2>

      <input
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />

      <button onClick={createGroup}>Next</button>
    </div>
  );
}

export default CreateGroup;
