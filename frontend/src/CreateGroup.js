import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);

  const navigate = useNavigate();

  const showPopup = (message, type = "success") => {
    setPopup({ message, type });
    setTimeout(() => setPopup(null), 3000);
  };

  const createGroup = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      showPopup("User not logged in", "error");
      navigate("/login");
      return;
    }

    if (!groupName.trim()) {
      showPopup("Group name is required", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/group/create",
        {
          groupName,
          description,
          adminId: user._id,
        }
      );

      const groupId = res.data._id;

      showPopup("Group Created Successfully 🎉");

      setTimeout(() => {
        navigate(`/add-members/${groupId}`);
      }, 1000);

    } catch (err) {
      showPopup(
        err.response?.data?.msg || "Error creating group",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="create-wrapper">

        <div className="create-card">

          <h2>Create New Group</h2>
          <p className="subtitle">
            Start collaborating by creating your own group.
          </p>

          <div className="input-group">
            <label>Group Name</label>
            <input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              maxLength={40}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <small>{groupName.length}/40 characters</small>
          </div>

          <div className="input-group">
            <label>Group Description</label>
            <textarea
              placeholder="Write a short description about this group..."
              value={description}
              maxLength={120}
              onChange={(e) => setDescription(e.target.value)}
            />
            <small>{description.length}/120 characters</small>
          </div>

          <div className="btn-group">
            <button
              className="secondary-btn"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>

            <button
              className="primary-btn"
              onClick={createGroup}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create & Continue →"}
            </button>
          </div>
        </div>

        {/* POPUP MESSAGE */}
        {popup && (
          <div className={`popup ${popup.type}`}>
            {popup.message}
          </div>
        )}

      </div>

      {/* ================= CSS ================= */}
      <style>{`
        * {
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        .create-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #0b3e71, #1f5fa3);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 30px;
        }

        .create-card {
          background: white;
          width: 100%;
          max-width: 520px;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          animation: fadeIn 0.4s ease-in-out;
        }

        .create-card h2 {
          color: #0b3e71;
          margin-bottom: 5px;
        }

        .subtitle {
          color: #666;
          margin-bottom: 30px;
        }

        .input-group {
          margin-bottom: 25px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #0b3e71;
        }

        input, textarea {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #ccc;
          font-size: 14px;
          transition: 0.3s;
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: #0b3e71;
          box-shadow: 0 0 0 3px rgba(11,62,113,0.15);
        }

        textarea {
          resize: none;
          height: 80px;
        }

        small {
          font-size: 12px;
          color: #888;
        }

        .btn-group {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .primary-btn {
          flex: 1;
          background: #0b3e71;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          transition: 0.3s;
        }

        .primary-btn:hover {
          background: #145da0;
        }

        .primary-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .secondary-btn {
          flex: 1;
          background: #f1f4f9;
          color: #0b3e71;
          border: none;
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: 0.3s;
        }

        .secondary-btn:hover {
          background: #e3ebf6;
        }

        /* POPUP */
        .popup {
          position: fixed;
          top: 30px;
          right: 30px;
          padding: 14px 22px;
          border-radius: 10px;
          font-weight: 500;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          animation: slideIn 0.3s ease;
          color: white;
        }

        .popup.success {
          background: #28a745;
        }

        .popup.error {
          background: #dc3545;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default CreateGroup;
