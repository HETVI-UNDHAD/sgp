import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import socket from "./socket";
import PollMessage from "./PollMessage";
import { API_URL } from "./config";
import "./Chat.css";

function Chat() {
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const API_BASE = API_URL;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user._id;
  const userName = user.fullName || user.email || "Guest";
  const userEmail = user.email || "";

  useEffect(() => {
    const fetchGroupAndMessages = async () => {
      try {
        setLoading(true);

        const groupRes = await axios.get(
          `${API_URL}/api/group/${groupId}`
        );
        setGroup(groupRes.data);

        const messagesRes = await axios.get(
          `${API_URL}/api/messages/group/${groupId}`
        );
        setMessages(messagesRes.data);

        socket.emit("joinGroup", groupId);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupAndMessages();
  }, [groupId]);

  useEffect(() => {
    const handleReceiveMessage = (messageData) => {
      setMessages((prev) => {
        const messageExists = prev.some(msg => msg._id === messageData._id);
        if (messageExists) return prev;
        return [...prev, messageData];
      });
      
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    const newMessage = {
      content: messageInput,
      sender: userId,
      senderName: userName,
      senderEmail: userEmail,
      groupId: groupId,
      status: "sent",
      timestamp: new Date(),
      _id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");

    try {
      const res = await axios.post(
        `${API_URL}/api/messages/send`,
        {
          content: messageInput,
          sender: userId,
          senderName: userName,
          senderEmail: userEmail,
          groupId: groupId,
        }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === newMessage._id ? res.data : msg
        )
      );

      socket.emit("sendMessage", res.data);

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

  const handleMarkAsRead = (messageId, status) => {
    if (status !== "read") {
      socket.emit("messageRead", {
        messageId,
        groupId,
      });

      axios.put(
        `${API_URL}/api/messages/${messageId}/read`
      ).catch(err => console.error("Error marking as read:", err));
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("groupId", groupId);
    formData.append("userEmail", userEmail);

    try {
      const res = await axios.post(
        `${API_URL}/api/files/upload`,
        formData
      );

      const relUrl = res.data.file.fileUrl;
      const messageData = {
        content: `📄 ${file.name}`,
        fileUrl: `${API_BASE}${relUrl}`,
        fileType: "document",
        sender: userId,
        senderName: userName,
        senderEmail: userEmail,
        groupId: groupId,
      };

      const msgRes = await axios.post(
        `${API_URL}/api/messages/send`,
        messageData
      );

      setMessages((prev) => [...prev, msgRes.data]);
      socket.emit("sendMessage", msgRes.data);
      setShowMenu(false);
    } catch (err) {
      console.error("Error uploading document:", err);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
    formData.append("userEmail", userEmail);

    try {
      const res = await axios.post(
        `${API_URL}/api/files/upload`,
        formData
      );

      const isVideo = file.type.startsWith("video/");
      const icon = isVideo ? "🎬" : "🖼️";

      const relUrl = res.data.file.fileUrl;
      const messageData = {
        content: `${icon} ${file.name}`,
        fileUrl: `${API_BASE}${relUrl}`,
        fileType: isVideo ? "video" : "photo",
        sender: userId,
        senderName: userName,
        senderEmail: userEmail,
        groupId: groupId,
      };

      const msgRes = await axios.post(
        `${API_URL}/api/messages/send`,
        messageData
      );

      setMessages((prev) => [...prev, msgRes.data]);
      socket.emit("sendMessage", msgRes.data);
      setShowMenu(false);
    } catch (err) {
      console.error("Error uploading photo/video:", err);
      alert("Failed to upload photo/video");
    } finally {
      setUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const StatusTick = ({ status }) => {
    if (status === "sent") return <span className="tick single">✓</span>;
    if (status === "delivered") return <span className="tick double">✓✓</span>;
    if (status === "read") return <span className="tick read">✓✓</span>;
    return null;
  };

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
      <div className="chat-header">
        <div>
          <h2>{group?.name || "Group Chat"}</h2>
          <p className="member-count">
            {group?.members?.length || 0} members
          </p>
        </div>
      </div>

      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>📬 No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.sender === userId || msg.senderEmail === userEmail;

            if (!isOwnMessage && msg.status !== "read") {
              handleMarkAsRead(msg._id, msg.status);
            }

            return (
              <div
                key={msg._id || `msg-${index}`}
                className={`message ${isOwnMessage ? "own-message" : "other-message"}`}
              >
                {!isOwnMessage && (
                  <div className="sender-info">
                    <span className="sender-name">{msg.senderName}</span>
                  </div>
                )}

                <div className="message-bubble">
                  {(msg.fileType === "photo" || msg.fileType === "video") && msg.fileUrl ? (
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
                  ) : msg.fileType === "document" && msg.fileUrl ? (
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="document-link"
                      download
                    >
                      {msg.content}
                    </a>
                  ) : msg.poll && msg.poll.question ? (
                    <PollMessage msg={msg} isOwnMessage={isOwnMessage} />
                  ) : msg.content ? (
                    <div className="message-content">{msg.content}</div>
                  ) : (
                    <div className="message-content" style={{opacity: 0.5}}>[Empty message]</div>
                  )}

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

      <form className="message-input-form" onSubmit={handleSendMessage}>
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
    </div>
  );
}

export default Chat;
