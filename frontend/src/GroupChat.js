import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function GroupChat() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [group, setGroup] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = user.email || "";
  const userName = user.fullName || user.email || "Guest";

  useEffect(() => {
    // Fetch group details
    axios.get(`http://localhost:5000/api/group/${groupId}`)
      .then(res => setGroup(res.data))
      .catch(err => console.error("Group fetch error:", err));

    // Fetch existing files
    axios.get(`http://localhost:5000/api/files/group/${groupId}`)
      .then(res => {
        console.log("✅ Files loaded:", res.data.length, "files");
        console.log("Files data:", res.data);
        setFiles(res.data);
      })
      .catch(err => console.error("Files fetch error:", err));

    // Fetch existing messages
    axios.get(`http://localhost:5000/api/messages/group/${groupId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("Messages fetch error:", err));

    // Join socket room
    socket.emit("joinGroup", groupId);

    // Listen for new files from other users
    socket.on("newFile", async () => {
      const filesRes = await axios.get(`http://localhost:5000/api/files/group/${groupId}`);
      setFiles(filesRes.data);
    });

    socket.on("fileDeleted", async () => {
      const filesRes = await axios.get(`http://localhost:5000/api/files/group/${groupId}`);
      setFiles(filesRes.data);
    });

    // Listen for new messages
    socket.on("receiveMessage", (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off("newFile");
      socket.off("fileDeleted");
      socket.off("receiveMessage");
    };
  }, [groupId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("groupId", groupId);
    formData.append("userEmail", userEmail);
    formData.append("userName", userName);

    try {
      const res = await axios.post("http://localhost:5000/api/files/upload", formData);
      console.log("✅ File uploaded:", res.data);
      // Refresh files from database instead of using socket data
      const filesRes = await axios.get(`http://localhost:5000/api/files/group/${groupId}`);
      console.log("✅ Files after upload:", filesRes.data.length);
      setFiles(filesRes.data);
      socket.emit("fileUploaded", { groupId, file: res.data.file });
      fileInputRef.current.value = "";
    } catch (err) {
      alert(err.response?.data?.msg || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (fileId, originalName) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5000/api/files/download/${fileId}`;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Delete this file?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/files/delete/${fileId}`, {
        data: { userEmail }
      });
      // Refresh files from database
      const filesRes = await axios.get(`http://localhost:5000/api/files/group/${groupId}`);
      setFiles(filesRes.data);
      socket.emit("fileDeleted", { groupId, fileId });
    } catch (err) {
      alert(err.response?.data?.msg || "Delete failed");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post("http://localhost:5000/api/messages/send", {
        content: newMessage,
        sender: user._id,
        senderName: userName,
        senderEmail: userEmail,
        groupId
      });
      socket.emit("sendMessage", { ...res.data, groupId });
      setNewMessage("");
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      alert("Failed to send message");
    }
  };

  const isImage = (type) => type?.startsWith("image/");

  return (
    <>
      <div className="chat-wrapper">
        <div className="chat-header">
          <h2>{group?.groupName || "Group Chat"}</h2>
          <button onClick={() => navigate("/dashboard")} className="back-btn">← Back</button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.senderEmail === userEmail ? 'own' : 'other'}`}>
              <strong>{msg.senderName || msg.senderEmail}</strong>
              <p>{msg.content}</p>
              <span className="time">{new Date(msg.timestamp || msg.createdAt).toLocaleTimeString()}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit">Send</button>
        </form>

        <div className="upload-section">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: "none" }}
          />
          <button onClick={() => fileInputRef.current.click()} disabled={uploading} className="upload-btn">
            {uploading ? "Uploading..." : "📎 Upload File"}
          </button>
        </div>

        <div className="files-container">
          {files.length === 0 ? (
            <p className="no-files">No files shared yet</p>
          ) : (
            files.map(file => (
              <div key={file._id} className="file-card">
                {isImage(file.fileType) ? (
                  <img src={`http://localhost:5000${file.fileUrl}`} alt={file.originalName} className="file-preview" />
                ) : (
                  <div className="file-icon">📄</div>
                )}
                <div className="file-info">
                  <p className="file-name">{file.originalName}</p>
                  <p className="file-meta">
                    {file.uploadedBy} • {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                  <button onClick={() => handleDownload(file._id, file.originalName)} className="download-btn">
                    ⬇ Download
                  </button>
                  {file.uploadedByEmail === userEmail && (
                    <button onClick={() => handleDelete(file._id)} className="delete-btn">
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .chat-wrapper {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f4f8ff;
        }
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg,#0b3e71,#1f5fa3);
          color: white;
          padding: 20px;
        }
        .back-btn {
          background: white;
          color: #0b3e71;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
        .message {
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 8px;
          max-width: 70%;
        }
        .message.own {
          background: #0b3e71;
          color: white;
          margin-left: auto;
          text-align: right;
        }
        .message.other {
          background: white;
          color: #333;
        }
        .message strong {
          display: block;
          font-size: 12px;
          margin-bottom: 5px;
        }
        .message p {
          margin: 5px 0;
        }
        .time {
          font-size: 10px;
          opacity: 0.7;
        }
        .message-input {
          display: flex;
          padding: 15px;
          background: white;
          border-top: 1px solid #ddd;
        }
        .message-input input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 20px;
          margin-right: 10px;
        }
        .message-input button {
          background: #0b3e71;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 20px;
          cursor: pointer;
        }
        .upload-section {
          text-align: center;
          margin-bottom: 30px;
        }
        .upload-btn {
          background: #0b3e71;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
        }
        .upload-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .files-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .file-card {
          background: white;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .file-preview {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        .file-icon {
          font-size: 80px;
          text-align: center;
          padding: 40px 0;
        }
        .file-info {
          text-align: center;
        }
        .file-name {
          font-weight: 600;
          margin: 8px 0;
          word-break: break-word;
        }
        .file-meta {
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
        }
        .download-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          margin-right: 8px;
        }
        .delete-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }
        .no-files {
          text-align: center;
          color: #999;
          padding: 40px;
        }
      `}</style>
    </>
  );
}

export default GroupChat;
