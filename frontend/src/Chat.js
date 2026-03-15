import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "./socket";
import PollMessage from "./PollMessage";
import { API_URL } from "./config";
import "./Chat.css";

function Chat() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [myGroups, setMyGroups] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [groupOrder, setGroupOrder] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedNewAdmin, setSelectedNewAdmin] = useState("");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const isDragging = useRef(false);
  const dragHandleRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const groupMenuRef = useRef(null);

  const API_BASE = API_URL;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user._id;
  const userName = user.fullName || user.email || "Guest";
  const userEmail = user.email || "";

  const isAdmin = user?._id === group?.adminId?.toString();

  // Sidebar resize drag
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const newWidth = Math.min(480, Math.max(180, e.clientX));
      setSidebarWidth(newWidth);
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (dragHandleRef.current) dragHandleRef.current.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Close group menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (groupMenuRef.current && !groupMenuRef.current.contains(e.target)) {
        setShowGroupMenu(false);
        setShowMembers(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const exitGroup = async () => {
    setLeaving(true);
    try {
      await axios.post(`${API_URL}/api/group/${groupId}/exit`, { userId });
      setShowLeaveModal(false);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Exit failed");
    } finally {
      setLeaving(false);
    }
  };

  const transferAdminAndLeave = async () => {
    if (!selectedNewAdmin) return alert("Please select a new admin");
    try {
      await axios.post(`${API_URL}/api/group/${groupId}/transfer-admin`, {
        adminId: userId,
        newAdminId: selectedNewAdmin,
      });
      await axios.post(`${API_URL}/api/group/${groupId}/exit`, { userId });
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to transfer admin");
    }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await axios.delete(`${API_URL}/api/group/${groupId}/remove/${memberId}`, { data: { adminId: userId } });
      const res = await axios.get(`${API_URL}/api/group/${groupId}`);
      setGroup(res.data);
    } catch (err) {
      alert(err.response?.data?.msg || "Remove failed");
    }
  };

  // Fetch user's groups for sidebar
  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_URL}/api/group/user/${userId}`)
      .then(res => {
        setMyGroups(res.data);
        setGroupOrder(res.data.map(g => g._id));
        if (res.data.length > 0) {
          const ids = res.data.map(g => g._id).join(",");
          axios.get(`${API_URL}/api/messages/unread?groupIds=${ids}&userEmail=${encodeURIComponent(userEmail)}`)
            .then(r => setUnreadCounts(r.data))
            .catch(() => {});
        }
      })
      .catch(err => console.error("Groups fetch error:", err));
  }, [userId]);

  // Track unread counts + bubble group to top when new message arrives
  useEffect(() => {
    const handleNewMsg = (messageData) => {
      // bump unread only for groups NOT currently open
      if (messageData.groupId !== groupId) {
        setUnreadCounts(prev => ({
          ...prev,
          [messageData.groupId]: (prev[messageData.groupId] || 0) + 1,
        }));
      }
      // always bubble the group that got a message to top
      setGroupOrder(prev => [
        messageData.groupId,
        ...prev.filter(id => id !== messageData.groupId),
      ]);
    };
    socket.on("receiveMessage", handleNewMsg);
    return () => socket.off("receiveMessage", handleNewMsg);
  }, [groupId]);

  // Clear unread count when switching to a group
  useEffect(() => {
    setUnreadCounts(prev => ({ ...prev, [groupId]: 0 }));
  }, [groupId]);

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
        socket._activeGroupId = groupId;

        // Mark all unread messages as read when opening the group
        socket.emit("markAllRead", { groupId, userEmail });
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
      if (messageData.groupId !== groupId) return;
      setMessages((prev) => {
        const exists = prev.some(msg =>
          msg._id && messageData._id && msg._id === messageData._id
        );
        if (exists) return prev;
        return [...prev, messageData];
      });
      setTimeout(() => {
        socket.emit("messageDelivered", { messageId: messageData._id, groupId });
      }, 500);
    };

    const handleUpdateStatus = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, status: data.status } : msg
        )
      );
    };

    // When another user reads all messages — update all our sent messages to read
    const handleAllMessagesRead = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderEmail === userEmail && msg.status !== "read"
            ? { ...msg, status: "read" }
            : msg
        )
      );
    };

    const handleUserTyping = (data) => {
      if (data.userId === userId) return;
      if (data.groupId !== groupId) return;
      setTypingUsers(prev =>
        prev.find(u => u.userId === data.userId)
          ? prev
          : [...prev, { userId: data.userId, userName: data.userName }]
      );
    };

    const handleUserStoppedTyping = (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("updateMessageStatus", handleUpdateStatus);
    socket.on("allMessagesRead", handleAllMessagesRead);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("updateMessageStatus", handleUpdateStatus);
      socket.off("allMessagesRead", handleAllMessagesRead);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
    };
  }, [groupId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim()) return;
    socket.emit("stopTyping", { groupId, userId, userName });
    clearTimeout(typingTimeoutRef.current);

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
      // bubble current group to top
      setGroupOrder(prev => [groupId, ...prev.filter(id => id !== groupId)]);
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
      setGroupOrder(prev => [groupId, ...prev.filter(id => id !== groupId)]);
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
      setGroupOrder(prev => [groupId, ...prev.filter(id => id !== groupId)]);
      setShowMenu(false);
    } catch (err) {
      console.error("Error uploading photo/video:", err);
      alert("Failed to upload photo/video");
    } finally {
      setUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const downloadAllFiles = async () => {
    setDownloading(true);
    setShowGroupMenu(false);
    try {
      const res = await axios.get(`${API_URL}/api/files/download-all/${groupId}`, {
        responseType: "blob",
      });
      const groupName = group?.groupName || "group";
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${groupName}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("No files found or download failed");
    } finally {
      setDownloading(false);
    }
  };

  const StatusTick = ({ status }) => {
    if (status === "sent") return (
      <svg className="tick-svg tick-sent" viewBox="0 0 16 11" fill="none">
        <path d="M1 5.5L5.5 10L15 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    if (status === "delivered") return (
      <svg className="tick-svg tick-delivered" viewBox="0 0 20 11" fill="none">
        <path d="M1 5.5L5.5 10L15 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 5.5L10.5 10L20 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    if (status === "read") return (
      <svg className="tick-svg tick-read" viewBox="0 0 20 11" fill="none">
        <path d="M1 5.5L5.5 10L15 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 5.5L10.5 10L20 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
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
    <div className="chat-layout">
      {/* LEFT SIDEBAR */}
      <div className="chat-sidebar" style={{ width: sidebarWidth }}>
        <div className="sidebar-header">
          <span>💬 My Groups</span>
        </div>
        <div className="sidebar-search-wrap">
          <span className="sidebar-search-icon">🔍</span>
          <input
            className="sidebar-search"
            placeholder="Search groups..."
            value={sidebarSearch}
            onChange={e => setSidebarSearch(e.target.value)}
          />
        </div>
        <div className="sidebar-groups">
          {[...myGroups]
            .sort((a, b) => groupOrder.indexOf(a._id) - groupOrder.indexOf(b._id))
            .filter(g => g.name.toLowerCase().includes(sidebarSearch.toLowerCase()))
            .map(g => (
            <div
              key={g._id}
              className={`sidebar-group-item ${g._id === groupId ? "active" : ""}`}
              onClick={() => navigate(`/messages/${g._id}`)}
            >
              <div className="sidebar-group-avatar">
                {g.name?.charAt(0).toUpperCase()}
              </div>
              <div className="sidebar-group-info">
                <span className="sidebar-group-name">{g.name}</span>
                <span className="sidebar-group-count">{g.memberCount} members</span>
              </div>
              {unreadCounts[g._id] > 0 && (
                <span className="sidebar-unread">{unreadCounts[g._id]}</span>
              )}
            </div>
          ))}
        </div>
        {/* DRAG HANDLE */}
        <div
          className="sidebar-resize-handle"
          ref={dragHandleRef}
          onMouseDown={(e) => {
            e.preventDefault();
            isDragging.current = true;
            dragHandleRef.current.classList.add('dragging');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
          }}
        />
      </div>

      {/* MAIN CHAT AREA */}
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-left">
            <button className="chat-back-btn" onClick={() => navigate("/dashboard")} title="Back to Dashboard">
              ←
            </button>
            <div>
              <h2>{group?.groupName || "Group Chat"}</h2>
              <p className="member-count">{group?.memberCount || 0} members</p>
            </div>
          </div>
          {/* THREE DOT MENU */}
          <div className="group-menu-wrapper" ref={groupMenuRef}>
            <button
              className="three-dot-btn"
              onClick={() => { setShowGroupMenu(p => !p); setShowMembers(false); }}
              title="Group options"
            >
              ⋮
            </button>

            {showGroupMenu && (
              <div className="group-dropdown">

                {/* ── Members section ── */}
                <div
                  className="gd-item gd-item-toggle"
                  onClick={() => setShowMembers(p => !p)}
                >
                  <span className="gd-icon">👥</span>
                  <span>Members ({group?.memberCount || 0})</span>
                  <span className="gd-chevron">{showMembers ? "▲" : "▼"}</span>
                </div>

                {showMembers && (
                  <div className="gd-members-list">
                    {group?.members?.map((m, i) => (
                      <div key={m.id || i} className="gd-member-row">
                        <div className="gd-member-avatar">{(m.fullName || m.email)?.charAt(0).toUpperCase()}</div>
                        <div className="gd-member-info">
                          <span className="gd-member-email">{m.fullName || m.email}</span>
                          {m.id?.toString() === group.adminId?.toString() && (
                            <span className="gd-admin-tag">Admin</span>
                          )}
                        </div>
                        {isAdmin && m.id?.toString() !== group.adminId?.toString() && (
                          <button className="gd-remove-btn" onClick={() => removeMember(m.id)}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="gd-divider" />

                {/* ── Add Members (admin only) ── */}
                {isAdmin && (
                  <div className="gd-item" onClick={() => { setShowGroupMenu(false); navigate(`/group/${groupId}/add-members`); }}>
                    <span className="gd-icon">➕</span>
                    <span>Add Members</span>
                  </div>
                )}

                {/* ── Download all files as ZIP ── */}
                <div className="gd-item" onClick={downloadAllFiles}>
                  <span className="gd-icon">📥</span>
                  <span>{downloading ? "Preparing ZIP..." : "Download All Files"}</span>
                </div>

                <div className="gd-divider" />

                {/* ── Video Call ── */}
                <div className="gd-item" onClick={() => { setShowGroupMenu(false); navigate(`/video-call/${groupId}`); }}>
                  <span className="gd-icon">📹</span>
                  <span>Video Call</span>
                </div>

                <div className="gd-divider" />

                {/* ── Leave Group (admin: transfer first) ── */}
                {isAdmin && (
                  <div className="gd-item gd-item-danger" onClick={() => { setShowGroupMenu(false); setShowTransferModal(true); }}>
                    <span className="gd-icon">🚪</span>
                    <span>Leave Group</span>
                  </div>
                )}

                {/* ── Leave Group (non-admin) ── */}
                {!isAdmin && (
                  <div className="gd-item gd-item-danger" onClick={() => { setShowGroupMenu(false); setShowLeaveModal(true); }}>
                    <span className="gd-icon">🚪</span>
                    <span>Leave Group</span>
                  </div>
                )}

              </div>
            )}
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
                className={`message ${
                  msg.isSystem
                    ? "system-message"
                    : isOwnMessage ? "own-message" : "other-message"
                }`}
              >
                {msg.isSystem ? (
                  <div className="system-bubble">{msg.content}</div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <span className="typing-dots"><span/><span/><span/></span>
            <span className="typing-text">
              {typingUsers.map(u => u.userName).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
            </span>
          </div>
        )}
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
          onChange={(e) => {
            setMessageInput(e.target.value);
            socket.emit("typing", { groupId, userId, userName });
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              socket.emit("stopTyping", { groupId, userId, userName });
            }, 2000);
          }}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button" title="Send message" disabled={uploading}>
          {uploading ? "⏳" : "📤"}
        </button>
      </form>
    </div>

      {/* LEAVE GROUP MODAL */}
      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Leave Group?</h3>
            <p>Are you sure you want to leave <strong>{group?.groupName}</strong>? You won't be able to see messages unless re-invited.</p>
            <div className="modal-actions">
              <button className="modal-btn modal-cancel" onClick={() => setShowLeaveModal(false)}>Cancel</button>
              <button
                className="modal-btn modal-confirm"
                style={{ background: "#ff7a45" }}
                onClick={exitGroup}
                disabled={leaving}
              >
                {leaving ? "Leaving..." : "Yes, Leave"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER ADMIN MODAL */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Transfer Admin & Leave</h3>
            <p>Select a new admin before you leave:</p>
            <select
              className="modal-select"
              value={selectedNewAdmin}
              onChange={e => setSelectedNewAdmin(e.target.value)}
            >
              <option value="">-- Select member --</option>
              {group?.members
                ?.filter(m => m.id?.toString() !== userId)
                .map(m => (
                  <option key={m.id} value={m.id}>{m.fullName || m.email}</option>
                ))}
            </select>
            <div className="modal-actions">
              <button className="modal-btn modal-cancel" onClick={() => setShowTransferModal(false)}>Cancel</button>
              <button className="modal-btn modal-confirm" onClick={transferAdminAndLeave}>Transfer &amp; Leave</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
