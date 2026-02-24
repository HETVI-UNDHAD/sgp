import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import socket from "./socket";
import PollMessage from "./PollMessage";
import "./Chat.css";

function Chat() {
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  // Get current user
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user._id;
  const userName = user.fullName || user.email || "Guest";
  const userEmail = user.email || "";

  // ✅ FETCH GROUP AND MESSAGES ON LOAD
  useEffect(() => {
    const fetchGroupAndMessages = async () => {
      try {
        setLoading(true);

        // Fetch group details
        const groupRes = await axios.get(
          `http://localhost:5000/api/group/${groupId}`
        );
        setGroup(groupRes.data);

        // Fetch message history
        const messagesRes = await axios.get(
          `http://localhost:5000/api/messages/group/${groupId}`
        );
        setMessages(messagesRes.data);

        // Join Socket.IO group room
        socket.emit("joinGroup", groupId);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupAndMessages();
  }, [groupId]);

  // ✅ LISTEN FOR INCOMING MESSAGES
  useEffect(() => {
    const handleReceiveMessage = (messageData) => {
      // Prevent duplicate messages - check if message already exists
      setMessages((prev) => {
        const messageExists = prev.some(msg => msg._id === messageData._id);
        if (messageExists) return prev; // Don't add duplicate
        return [...prev, messageData];
      });
      
      // Auto-mark as delivered
      setTimeout(() => {
        socket.emit("messageDelivered", {
          messageId: messageData._id,
          groupId,
        });
      }, 500);
    };

    const handleUpdateStatus = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, status: data.status }
            : msg
        )
      );
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("updateMessageStatus", handleUpdateStatus);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("updateMessageStatus", handleUpdateStatus);
    };
  }, [groupId]);

  // ✅ AUTO-SCROLL TO BOTTOM
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ SEND MESSAGE
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    // Create message object
    const newMessage = {
      content: messageInput,
      sender: userId,
      senderName: userName,
      senderEmail: userEmail,
      groupId: groupId,
      status: "sent",
      timestamp: new Date(),
      _id: Date.now().toString(), // Temporary ID for UI
    };

    // Add to local state immediately (optimistic update)
    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");

    try {
      // Save to database
      const res = await axios.post(
        "http://localhost:5000/api/messages/send",
        {
          content: messageInput,
          sender: userId,
          senderName: userName,
          senderEmail: userEmail,
          groupId: groupId,
        }
      );

      // Update message with actual DB ID and timestamp
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === newMessage._id ? res.data : msg
        )
      );

      // Broadcast to other users
      socket.emit("sendMessage", res.data);

      // Auto-mark as delivered after a short delay
      setTimeout(() => {
        socket.emit("messageDelivered", {
          messageId: res.data._id,
          groupId,
        });
      }, 300);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message");
    }
  };

  // ✅ MARK MESSAGE AS READ WHEN VIEWING
  const handleMarkAsRead = (messageId, status) => {
    if (status !== "read") {
      socket.emit("messageRead", {
        messageId,
        groupId,
      });

      // Update DB
      axios.put(
        `http://localhost:5000/api/messages/${messageId}/read`
      ).catch(err => console.error("Error marking as read:", err));
    }
  };

  // ✅ HANDLE DOCUMENT UPLOAD
  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("groupId", groupId);
    formData.append("email", userEmail);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/files/upload",
        formData
      );

      // Send as message
      const newMessage = {
        content: `📄 ${file.name}`,
        fileUrl: res.data.file.fileUrl,
        fileType: "document",
        sender: userId,
        senderName: userName,
        senderEmail: userEmail,
        groupId: groupId,
        status: "sent",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      socket.emit("sendMessage", newMessage);
      setShowMenu(false);
    } catch (err) {
      console.error("Error uploading document:", err);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ✅ HANDLE PHOTO/VIDEO UPLOAD
  const handlePhotoVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("groupId", groupId);
    formData.append("email", userEmail);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/files/upload",
        formData
      );

      const isVideo = file.type.startsWith("video/");
      const icon = isVideo ? "🎬" : "🖼️";

      // Send as message
      const newMessage = {
        content: `${icon} ${file.name}`,
        fileUrl: res.data.file.fileUrl,
        fileType: isVideo ? "video" : "photo",
        sender: userId,
        senderName: userName,
        senderEmail: userEmail,
        groupId: groupId,
        status: "sent",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      socket.emit("sendMessage", newMessage);
      setShowMenu(false);
    } catch (err) {
      console.error("Error uploading photo/video:", err);
      alert("Failed to upload photo/video");
    } finally {
      setUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  // ✅ HANDLE POLL CREATION
  const handleCreatePoll = () => {
    if (!pollQuestion.trim()) {
      alert("Poll question is required");
      return;
    }

    const validOptions = pollOptions.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      alert("Poll needs at least 2 options");
      return;
    }

    const newMessage = {
      content: `📊 Poll: ${pollQuestion}`,
      poll: {
        question: pollQuestion,
        options: validOptions.map((text) => ({
          text,
          votes: [],
          count: 0,
        })),
      },
      sender: userId,
      senderName: userName,
      senderEmail: userEmail,
      groupId: groupId,
      status: "sent",
      timestamp: new Date(),
      _id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    socket.emit("sendMessage", newMessage);
    setShowMenu(false);
    setShowPollForm(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
  };

  // ✅ ADD POLL OPTION
  const handleAddOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  // ✅ UPDATE POLL OPTION
  const handleOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  // ✅ REMOVE POLL OPTION
  const handleRemoveOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  // ✅ STATUS INDICATOR COMPONENT
  const StatusTick = ({ status }) => {
    if (status === "sent") return <span className="tick single">✓</span>;
    if (status === "delivered") return <span className="tick double">✓✓</span>;
    if (status === "read") return <span className="tick read">✓✓</span>;
    return null;
  };

  // ✅ FORMAT TIME
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return <div className="chat-loading">Loading chat...</div>;
  }

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div>
          <h2>{group?.name || "Group Chat"}</h2>
          <p className="member-count">
            {group?.members?.length || 0} members
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>📬 No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender === userId || msg.senderEmail === userEmail;

            // Trigger read status when viewing message
            if (!isOwnMessage && msg.status !== "read") {
              handleMarkAsRead(msg._id, msg.status);
            }

            return (
              <div
                key={msg._id}
                className={`message ${isOwnMessage ? "own-message" : "other-message"}`}
              >
                {/* Sender Info (for other messages) */}
                {!isOwnMessage && (
                  <div className="sender-info">
                    <span className="sender-name">{msg.senderName}</span>
                  </div>
                )}

                {/* Message Bubble */}
                <div className="message-bubble">
                  {/* Poll Message */}
                  {msg.poll ? (
                    <PollMessage msg={msg} isOwnMessage={isOwnMessage} />
                  ) : msg.fileType === "photo" || msg.fileType === "video" ? (
                    <>
                      {msg.fileType === "photo" ? (
                        <img
                          src={msg.fileUrl}
                          alt={msg.content}
                          className="message-media"
                        />
                      ) : (
                        <video
                          src={msg.fileUrl}
                          controls
                          className="message-media"
                        />
                      )}
                      <div className="message-content">{msg.content}</div>
                    </>
                  ) : msg.fileType === "document" ? (
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="document-link"
                    >
                      {msg.content}
                    </a>
                  ) : (
                    <div className="message-content">{msg.content}</div>
                  )}

                  {/* Timestamp + Status Ticks */}
                  <div className="message-footer">
                    <span className="timestamp">
                      {formatTime(msg.timestamp)}
                    </span>
                    {isOwnMessage && !msg.poll && (
                      <StatusTick status={msg.status} />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form className="message-input-form" onSubmit={handleSendMessage}>
        
        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleDocumentUpload}
          style={{ display: "none" }}
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
        />
        <input
          ref={photoInputRef}
          type="file"
          onChange={handlePhotoVideoUpload}
          style={{ display: "none" }}
          accept="image/*,video/*"
        />

        {/* 3-Dot Menu */}
        <div className="menu-container">
          <button
            type="button"
            className="menu-button"
            onClick={() => setShowMenu(!showMenu)}
            title="Add attachments"
          >
            ⋮
          </button>

          {showMenu && (
            <div className="menu-dropdown">
              <button
                type="button"
                className="menu-option"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                📄 Document
              </button>
              <button
                type="button"
                className="menu-option"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploading}
              >
                🖼️ Photos & Videos
              </button>
              <button
                type="button"
                className="menu-option"
                onClick={handleCreatePoll}
                disabled={uploading}
              >
                📊 Poll
              </button>
            </div>
          )}
        </div>

        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button" title="Send message" disabled={uploading}>
          {uploading ? "⏳" : "📤"}
        </button>
      </form>

      {/* Poll Creation Form Modal */}
      {showPollForm && (
        <div className="poll-form-overlay">
          <div className="poll-form-modal">
            <h3>Create a Poll</h3>

            <div className="form-group">
              <label>Question:</label>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Enter poll question..."
                className="poll-input"
              />
            </div>

            <div className="form-group">
              <label>Options:</label>
              {pollOptions.map((option, index) => (
                <div key={index} className="option-input-group">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="poll-option-input"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="remove-option-btn"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {pollOptions.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="add-option-btn"
                >
                  + Add Option
                </button>
              )}
            </div>

            <div className="poll-form-buttons">
              <button
                type="button"
                onClick={handleCreatePoll}
                className="poll-submit-btn"
              >
                Create Poll
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPollForm(false);
                  setPollQuestion("");
                  setPollOptions(["", ""]);
                }}
                className="poll-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
