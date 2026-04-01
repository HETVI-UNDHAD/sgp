import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);
  const [selectedMsgs, setSelectedMsgs] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const longPressTimer = useRef(null);
  const isDragging = useRef(false);
  const dragHandleRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const groupMenuRef = useRef(null);
  const threeDotBtnRef = useRef(null);
  const dropdownPortalRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const emojiPickerRef = useRef(null);

  const API_BASE = API_URL;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user._id;
  const userName = user.fullName || user.email || "Guest";
  const userEmail = user.email || "";

  const isAdmin = user?._id === group?.adminId?.toString();

  const EMOJIS = ["😀","😂","😍","🥰","😎","🤔","👍","👎","❤️","🔥","🎉","😢","😡","🙏","💯","✅","🚀","👀","💪","🤝","😴","🤣","😊","🥳","👏"];

  const showToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev.slice(-2), { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmModal({ message, onConfirm });
  };

  const enterSelectMode = (msgId) => {
    setSelectMode(true);
    setSelectedMsgs(new Set([msgId]));
  };

  const toggleSelectMsg = (msgId) => {
    if (!selectMode) return;
    setSelectedMsgs(prev => {
      const next = new Set(prev);
      next.has(msgId) ? next.delete(msgId) : next.add(msgId);
      return next;
    });
  };

  const cancelSelectMode = () => {
    setSelectMode(false);
    setSelectedMsgs(new Set());
  };

  const canDeleteForEveryone = () => {
    return [...selectedMsgs].every(id => {
      const msg = messages.find(m => m._id === id);
      return msg && (msg.sender === userId || msg.senderEmail === userEmail);
    });
  };

  const deleteSelectedMsgs = async (deleteType) => {
    const ids = [...selectedMsgs];
    // Optimistic update
    if (deleteType === "everyone") {
      setMessages(prev => prev.filter(m => !ids.includes(m._id)));
    } else {
      setMessages(prev => prev.filter(m => !ids.includes(m._id)));
    }
    cancelSelectMode();
    setShowDeleteModal(false);
    try {
      await axios.post(`${API_URL}/api/messages/bulk-delete`, {
        messageIds: ids, userId, deleteType, groupId,
      });
      showToast(
        `${ids.length} message${ids.length > 1 ? "s" : ""} deleted`,
        "success"
      );
    } catch (err) {
      showToast(err.response?.data?.msg || "Delete failed", "error");
      // Revert on failure — refetch
      const res = await axios.get(`${API_URL}/api/messages/group/${groupId}?userId=${userId}`);
      setMessages(res.data);
    }
  };

  const copySelectedMsgs = async () => {
    const ordered = messages
      .filter(m => selectedMsgs.has(m._id))
      .map(m => m.content || "")
      .join("\n");
    try {
      await navigator.clipboard.writeText(ordered);
      showToast(`${selectedMsgs.size} message${selectedMsgs.size > 1 ? "s" : ""} copied`, "success");
    } catch {
      showToast("Copy failed", "error");
    }
    cancelSelectMode();
  };

  const handleMsgPointerDown = (msgId) => {
    longPressTimer.current = setTimeout(() => enterSelectMode(msgId), 500);
  };

  const handleMsgPointerUp = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleMsgContextMenu = (e, msgId) => {
    e.preventDefault();
    enterSelectMode(msgId);
  };

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

  // Close group menu + emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !(threeDotBtnRef.current && threeDotBtnRef.current.contains(e.target)) &&
        !(dropdownPortalRef.current && dropdownPortalRef.current.contains(e.target))
      ) {
        setShowGroupMenu(false);
        setShowMembers(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    
    if (showGroupMenu || showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showGroupMenu, showEmojiPicker]);

  const exitGroup = async () => {
    setLeaving(true);
    try {
      await axios.post(`${API_URL}/api/group/${groupId}/exit`, { userId });
      setShowLeaveModal(false);
      navigate("/dashboard");
    } catch (err) {
      showToast(err.response?.data?.msg || "Exit failed", "error");
    } finally {
      setLeaving(false);
    }
  };

  const transferAdminAndLeave = async () => {
    if (!selectedNewAdmin) return showToast("Please select a new admin", "error");
    try {
      await axios.post(`${API_URL}/api/group/${groupId}/transfer-admin`, {
        adminId: userId,
        newAdminId: selectedNewAdmin,
      });
      await axios.post(`${API_URL}/api/group/${groupId}/exit`, { userId });
      navigate("/dashboard");
    } catch (err) {
      showToast(err.response?.data?.msg || "Failed to transfer admin", "error");
    }
  };

  const removeMember = (memberId) => {
    showConfirm("Remove this member from the group?", async () => {
      try {
        await axios.delete(`${API_URL}/api/group/${groupId}/remove/${memberId}`, { data: { adminId: userId } });
        const res = await axios.get(`${API_URL}/api/group/${groupId}`);
        setGroup(res.data);
        showToast("Member removed", "success");
      } catch (err) {
        showToast(err.response?.data?.msg || "Remove failed", "error");
      }
    });
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
          `${API_URL}/api/messages/group/${groupId}?userId=${userId}`
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

  // Listen for presence updates
  useEffect(() => {
    socket.emit("userOnline", userId);
    const handlePresence = (data) => {
      setOnlineStatus(prev => ({ ...prev, [data.userId]: { isOnline: data.isOnline, lastSeen: data.lastSeen } }));
    };
    socket.on("presenceUpdate", handlePresence);
    return () => socket.off("presenceUpdate", handlePresence);
  }, [userId]);

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

    // When another user reads messages — update readBy on our sent messages
    const handleAllMessagesRead = (data) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.senderEmail !== userEmail) return msg;
          const alreadyIn = msg.readBy?.some(r => r.userId === data.userId);
          const newReadBy = alreadyIn
            ? msg.readBy
            : [...(msg.readBy || []), { userId: data.userId, userName: data.userName, readAt: new Date() }];
          const allRead = group && newReadBy.length >= (group.memberCount || 1) - 1;
          return { ...msg, readBy: newReadBy, status: allRead ? "read" : msg.status };
        })
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

    socket.on("messagesDeleted", (data) => {
      if (data.deleteType === "everyone") {
        setMessages(prev => prev.filter(m => !data.messageIds.includes(m._id)));
      } else if (data.userId === userId) {
        setMessages(prev => prev.filter(m => !data.messageIds.includes(m._id)));
      }
    });

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("updateMessageStatus", handleUpdateStatus);
    socket.on("allMessagesRead", handleAllMessagesRead);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);

    return () => {
      socket.off("messagesDeleted");
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
      ...(replyTo && { replyTo: { _id: replyTo._id, senderName: replyTo.senderName, content: replyTo.content } }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
    setReplyTo(null);

    try {
      const res = await axios.post(
        `${API_URL}/api/messages/send`,
        {
          content: messageInput,
          sender: userId,
          senderName: userName,
          senderEmail: userEmail,
          groupId: groupId,
          ...(replyTo && { replyTo: { _id: replyTo._id, senderName: replyTo.senderName, content: replyTo.content } }),
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
      showToast("Failed to send message", "error");
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
      showToast("Failed to upload document", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePhotoVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      showToast("File size must be less than 50MB", "error");
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
      showToast("Failed to upload photo/video", "error");
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
      showToast("No files found or download failed", "error");
    } finally {
      setDownloading(false);
    }
  };

  const clearChat = async () => {
    setClearing(true);
    
    try {
      const response = await axios.delete(`${API_URL}/api/messages/group/${groupId}/clear`, {
        data: { userId },
        headers: { 'Content-Type': 'application/json' }
      });
      
      setMessages([]);
      setShowClearModal(false);
      showToast("Chat cleared successfully", "success");
    } catch (err) {
      console.error('Clear chat error:', err);
      showToast(err.response?.data?.msg || err.message || "Failed to clear chat", "error");
    } finally {
      setClearing(false);
    }
  };

  const StatusTick = ({ status, readBy }) => {
  const seenBy = readBy && readBy.length > 0
    ? `Seen by: ${readBy.map(r => r.userName || "Someone").join(", ")}`
    : "";

  if (status === "sent") return (
    <svg className="tick-svg tick-sent" viewBox="0 0 16 11" fill="none" title="Sent">
      <path d="M1 5.5L5.5 10L15 1" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
  if (status === "delivered") return (
    <svg className="tick-svg tick-delivered" viewBox="0 0 20 11" fill="none" title="Delivered">
      <path d="M1 5.5L5.5 10L15 1" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M6 5.5L10.5 10L20 1" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
  if (status === "read") return (
    <span className="tick-read-wrap" title={seenBy}>
      <svg className="tick-svg tick-read" viewBox="0 0 20 11" fill="none">
        <path d="M1 5.5L5.5 10L15 1" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M6 5.5L10.5 10L20 1" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
      {readBy && readBy.length > 0 && (
        <span className="seen-count">{readBy.length}</span>
      )}
    </span>
  );
  return null;
};



  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const formatDateLabel = (timestamp) => {
    const d = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Get online/last-seen text for the current group's members (for 1-on-1 or group)
  const getHeaderStatus = () => {
    if (!group) return null;
    // For group chats show online member count
    const members = group.members || [];
    const onlineCount = members.filter(m => onlineStatus[m.id]?.isOnline).length;
    if (onlineCount > 0) return { isOnline: true, text: `${onlineCount} online` };
    return { isOnline: false, text: `${group.memberCount || 0} members` };
  };

  const headerStatus = getHeaderStatus();

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
              <div className="header-status">
                <span className={`status-dot ${headerStatus?.isOnline ? "online" : "offline"}`} />
                <span className="status-text">{headerStatus?.text}</span>
              </div>
            </div>
          </div>
          {/* THREE DOT MENU */}
          <div className="group-menu-wrapper" ref={groupMenuRef}>
            <button
              ref={threeDotBtnRef}
              className="three-dot-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (!showGroupMenu) {
                  const rect = threeDotBtnRef.current.getBoundingClientRect();
                  setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
                }
                setShowGroupMenu(prev => !prev);
                setShowMembers(false);
              }}
              title="Group options"
            >
              ⋮
            </button>

            {showGroupMenu && createPortal(
              <div
                ref={dropdownPortalRef}
                className="group-dropdown"
                style={{ top: dropdownPos.top, right: dropdownPos.right }}
                onClick={(e) => e.stopPropagation()}
              >

                {/* ── Members section ── */}
                <button
                  className="gd-item gd-item-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMembers(prev => !prev);
                  }}
                >
                  <span className="gd-icon">👥</span>
                  <span>Members ({group?.memberCount || 0})</span>
                  <span className="gd-chevron">{showMembers ? "▲" : "▼"}</span>
                </button>

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
                          <button 
                            className="gd-remove-btn" 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMember(m.id);
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="gd-divider" />

                {/* ── Add Members (admin only) ── */}
                {isAdmin && (
                  <button 
                    className="gd-item" 
                    onClick={(e) => { 
                      e.stopPropagation();
                      setShowGroupMenu(false); 
                      navigate(`/group/${groupId}/add-members`); 
                    }}
                  >
                    <span className="gd-icon">➕</span>
                    <span>Add Members</span>
                  </button>
                )}

                {/* ── Download all files as ZIP ── */}
                <button 
                  className="gd-item" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGroupMenu(false);
                    downloadAllFiles();
                  }}
                  disabled={downloading}
                >
                  <span className="gd-icon">📥</span>
                  <span>{downloading ? "Preparing ZIP..." : "Download All Files"}</span>
                </button>

                {/* ── Clear Chat ── */}
                <button 
                  className="gd-item" 
                  onClick={(e) => { 
                    e.stopPropagation();
                    setShowGroupMenu(false); 
                    setShowClearModal(true); 
                  }}
                >
                  <span className="gd-icon">🗑️</span>
                  <span>Clear Chat</span>
                </button>

                <div className="gd-divider" />

                {/* ── Video Call ── */}
                <button 
                  className="gd-item" 
                  onClick={(e) => { 
                    e.stopPropagation();
                    setShowGroupMenu(false); 
                    navigate(`/video-call/${groupId}`); 
                  }}
                >
                  <span className="gd-icon">📹</span>
                  <span>Video Call</span>
                </button>

                <div className="gd-divider" />

                {/* ── Leave Group (admin: transfer first) ── */}
                {isAdmin && (
                  <button 
                    className="gd-item gd-item-danger" 
                    onClick={(e) => { 
                      e.stopPropagation();
                      setShowGroupMenu(false); 
                      setShowTransferModal(true); 
                    }}
                  >
                    <span className="gd-icon">🚪</span>
                    <span>Leave Group</span>
                  </button>
                )}

                {/* ── Leave Group (non-admin) ── */}
                {!isAdmin && (
                  <button 
                    className="gd-item gd-item-danger" 
                    onClick={(e) => { 
                      e.stopPropagation();
                      setShowGroupMenu(false); 
                      setShowLeaveModal(true); 
                    }}
                  >
                    <span className="gd-icon">🚪</span>
                    <span>Leave Group</span>
                  </button>
                )}

              </div>
            , document.body)}
          </div>
        </div>

      {/* SELECTION TOP BAR */}
      {selectMode && (
        <div className="sel-bar">
          <button className="sel-bar-cancel" onClick={cancelSelectMode}>✕</button>
          <span className="sel-bar-count">{selectedMsgs.size} selected</span>
          <div className="sel-bar-actions">
            <button className="sel-bar-btn" onClick={copySelectedMsgs} title="Copy">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/></svg>
              Copy
            </button>
            <button className="sel-bar-btn sel-bar-btn-danger" onClick={() => setShowDeleteModal(true)} title="Delete">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="messages-area" onClick={() => selectMode && cancelSelectMode()}>
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

            // Date separator logic
            const prevMsg = messages[index - 1];
            const showDateSep = !prevMsg ||
              new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();

            return (
              <React.Fragment key={msg._id || `msg-${index}`}>
              {showDateSep && (
                <div className="date-separator">
                  <span className="date-label">{formatDateLabel(msg.timestamp)}</span>
                </div>
              )}
              <div
                className={`message ${
                  msg.isSystem
                    ? "system-message"
                    : isOwnMessage ? "own-message" : "other-message"
                }${selectedMsgs.has(msg._id) ? " msg-selected" : ""}`}
                onPointerDown={() => !msg.isSystem && handleMsgPointerDown(msg._id)}
                onPointerUp={handleMsgPointerUp}
                onPointerLeave={handleMsgPointerUp}
                onContextMenu={(e) => !msg.isSystem && handleMsgContextMenu(e, msg._id)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectMode && !msg.isSystem) toggleSelectMsg(msg._id);
                }}
                style={{ cursor: selectMode ? "pointer" : "default" }}
              >
                {msg.isSystem ? (
                  <div className="system-bubble">{msg.content}</div>
                ) : (
                  <>
                {selectMode && (
                  <div className={`msg-checkbox ${isOwnMessage ? "msg-checkbox-own" : ""}`}>
                    <div className={`msg-check-circle ${selectedMsgs.has(msg._id) ? "checked" : ""}`}>
                      {selectedMsgs.has(msg._id) && <span>✓</span>}
                    </div>
                  </div>
                )}
                {!isOwnMessage && (
                  <div className="sender-info">
                    <span className="sender-name">{msg.senderName}</span>
                  </div>
                )}
                <div className="message-row">
                <div className="message-bubble">
                  {msg.replyTo && (
                    <div className="reply-preview">
                      <span className="reply-sender">{msg.replyTo.senderName}</span>
                      <span className="reply-text">{msg.replyTo.content?.slice(0, 80)}{msg.replyTo.content?.length > 80 ? "..." : ""}</span>
                    </div>
                  )}
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
                    {isOwnMessage && !msg.poll && <StatusTick status={msg.status} readBy={msg.readBy} />}
                  </div>
                </div>
                <button
                  className="reply-btn"
                  title="Reply"
                  onClick={() => setReplyTo(msg)}
                >
                  ↩
                </button>
                </div>
                  </>
                )}
              </div>
              </React.Fragment>
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
        {replyTo && (
          <div className="reply-bar">
            <div className="reply-bar-content">
              <span className="reply-bar-name">{replyTo.senderName}</span>
              <span className="reply-bar-text">{replyTo.content?.slice(0, 80)}{replyTo.content?.length > 80 ? "..." : ""}</span>
            </div>
            <button type="button" className="reply-bar-close" onClick={() => setReplyTo(null)}>✕</button>
          </div>
        )}
        <div className="message-input-row">
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
        <div style={{ position: "relative" }} ref={emojiPickerRef}>
          <button
            type="button"
            className="emoji-btn"
            onClick={() => setShowEmojiPicker(p => !p)}
            title="Emoji"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker-wrap">
              {EMOJIS.map(em => (
                <span
                  key={em}
                  className="emoji-item"
                  onClick={() => { setMessageInput(prev => prev + em); setShowEmojiPicker(false); }}
                >
                  {em}
                </span>
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="send-button" title="Send message" disabled={uploading}>
          {uploading ? "⏳" : (
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        </div>
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

      {/* CLEAR CHAT MODAL */}
      {showClearModal && (
        <div className="modal-overlay" onClick={() => setShowClearModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Clear Chat?</h3>
            <p>This will clear all messages for <strong>you only</strong>. Other members will still see the chat.</p>
            <div className="modal-actions">
              <button className="modal-btn modal-cancel" onClick={() => setShowClearModal(false)}>Cancel</button>
              <button
                className="modal-btn modal-confirm"
                style={{ background: "#ff4757" }}
                onClick={clearChat}
                disabled={clearing}
              >
                {clearing ? "Clearing..." : "Clear Chat"}
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

      {/* DELETE MESSAGES MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Delete {selectedMsgs.size} message{selectedMsgs.size > 1 ? "s" : ""}?</h3>
            <p>Choose how you want to delete the selected message{selectedMsgs.size > 1 ? "s" : ""}.</p>
            <div className="del-modal-actions">
              <button className="modal-btn modal-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button
                className="modal-btn del-btn-me"
                onClick={() => deleteSelectedMsgs("me")}
              >
                Delete for Me
              </button>
              {canDeleteForEveryone() && (
                <button
                  className="modal-btn del-btn-everyone"
                  onClick={() => deleteSelectedMsgs("everyone")}
                >
                  Delete for Everyone
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATIONS */}
      <div className="app-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`app-toast app-toast-${t.type}`}>
            <span className="app-toast-icon">
              {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
            </span>
            <span className="app-toast-msg">{t.msg}</span>
            <button className="app-toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>✕</button>
          </div>
        ))}
      </div>

      {/* CONFIRM MODAL */}
      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Confirm</h3>
            <p>{confirmModal.message}</p>
            <div className="modal-actions">
              <button className="modal-btn modal-cancel" onClick={() => setConfirmModal(null)}>Cancel</button>
              <button className="modal-btn modal-confirm" style={{ background: "#ef4444" }} onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
