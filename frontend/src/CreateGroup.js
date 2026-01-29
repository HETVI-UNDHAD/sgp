import { useState } from "react";
import axios from "axios";

function CreateGroup() {
  const [groupName, setGroupName] = useState("");

  const createGroup = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await axios.post("http://localhost:5000/api/group/create", {
      groupName,
      adminId: user.id,
    });

    localStorage.setItem("groupId", res.data._id);
    window.location.href = "/add-members";
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
