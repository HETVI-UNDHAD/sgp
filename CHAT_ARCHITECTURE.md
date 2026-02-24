# 🏗️ Chat System Architecture

## 📊 Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER 1 (SENDER)                          │
│                      Frontend (React)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. User types message and clicks Send                    │   │
│  │ 2. Message shown locally with ✓ (sent status)           │   │
│  │ 3. Socket.emit("sendMessage", messageData)              │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    Socket.IO Connection
                             │
                             ↓
┌────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVER                          │
│                      Node.js + Express                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Receive "sendMessage" event                          │  │
│  │ 2. Save message to MongoDB database                     │  │
│  │ 3. Broadcast to group room: "receiveMessage"            │  │
│  │ 4. Update status to "delivered"                         │  │
│  │ 5. Emit "updateMessageStatus" to all users              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────┬───────────────────────────────┬───────────────────┘
             │                               │
    Socket.IO Broadcast              Socket.IO Broadcast
             │                               │
             ↓                               ↓
┌──────────────────────────────┐ ┌──────────────────────────────┐
│   USER 1 (SENDER)            │ │   USER 2 (RECEIVER)          │
│   Frontend (React)           │ │   Frontend (React)           │
│ ┌──────────────────────────┐ │ │ ┌──────────────────────────┐ │
│ │ Updates status to        │ │ │ │ 1. Receives message      │ │
│ │ ✓✓ (delivered)          │ │ │ │ 2. Message displayed     │ │
│ │                          │ │ │ │ 3. Auto-emit             │ │
│ │                          │ │ │ │    "messageDelivered"    │ │
│ │                          │ │ │ │ 4. Ticks show ✓✓         │ │
│ │                          │ │ │ │                          │ │
│ │                          │ │ │ │ 5. User views message    │ │
│ │                          │ │ │ │ 6. Emit "messageRead"    │ │
│ └──────────────────────────┘ │ │ └──────────────────────────┘ │
│                              │ │                              │
│ Sees ✓✓ blue (read)         │ │ Ticks show ✓✓ blue (read)   │
└──────────────────────────────┘ └──────────────────────────────┘
```

---

## 🔄 Message Lifecycle

```javascript
1. COMPOSE STAGE (Client)
   ├─ User types: "Hello everyone!"
   ├─ Stored in React state
   └─ Ready to send

2. SEND STAGE (Optimistic Update)
   ├─ Message added to local UI immediately
   ├─ Status: ✓ (sent)
   ├─ axios.post("/api/messages/send", {...})
   └─ socket.emit("sendMessage", {...})

3. DATABASE STAGE (Backend)
   ├─ Message saved to MongoDB
   ├─ Assigned unique _id
   ├─ Timestamp recorded
   └─ Status: "sent"

4. BROADCAST STAGE (All Users)
   ├─ Backend broadcasts to group room
   ├─ All users in group receive it
   ├─ Displayed in their chat UI
   └─ Status: ✓ (sent)

5. DELIVERY STAGE (Auto)
   ├─ Receiver acknowledges receipt (after 300ms)
   ├─ socket.emit("messageDelivered", {...})
   ├─ Backend updates in MongoDB: status = "delivered"
   ├─ Backend broadcasts update to all users
   └─ Status: ✓✓ (delivered)

6. READ STAGE (User Action)
   ├─ User reads message (comes into view)
   ├─ socket.emit("messageRead", {...})
   ├─ Backend updates: status = "read"
   ├─ Backend broadcasts update
   └─ Status: ✓✓ (blue - read)
```

---

## 📱 Component Structure

```javascript
App.js
 ├─ <BrowserRouter>
 │   └─ <Routes>
 │       ├─ <Route path="/dashboard" element={<Dashboard />} />
 │       ├─ <Route path="/group/:groupId" element={<GroupDetails />} />
 │       └─ <Route path="/messages/:groupId" element={<Chat />} /> // NEW
 │
 └─ Chat Component (NEW)
    ├─ State:
    │   ├─ messages: Message[]
    │   ├─ messageInput: string
    │   └─ group: Group
    │
    ├─ useEffect Hooks:
    │   ├─ Fetch group & messages on mount
    │   ├─ Join Socket.IO room
    │   └─ Listen for: receiveMessage, updateMessageStatus
    │
    ├─ Event Handlers:
    │   ├─ handleSendMessage()
    │   ├─ handleMarkAsRead()
    │   └─ StatusTick() component
    │
    └─ Rendered Elements:
        ├─ Chat Header (group name, member count)
        ├─ Messages List
        │   ├─ Own Messages (right-aligned, green)
        │   └─ Other Messages (left-aligned, white)
        │       ├─ Sender name
        │       ├─ Message content
        │       ├─ Timestamp
        │       └─ Status ticks (for own messages)
        └─ Message Input Form
            ├─ Text input
            └─ Send button
```

---

## 🗄️ Database Schema

### **Message Collection**
```javascript
{
  _id: ObjectId,
  content: String,              // "Hello!"
  sender: ObjectId,             // Reference to User
  senderName: String,           // "John Doe"
  senderEmail: String,          // "john@example.com"
  groupId: ObjectId,            // Reference to Group
  status: "sent" | "delivered" | "read",
  timestamp: Date,              // 2024-02-23T10:30:45.123Z
  createdAt: Date,              // Mongo default
  updatedAt: Date               // Mongo default
}
```

---

## 🔌 Socket.IO Events Reference

### **Frontend → Backend**

```javascript
// Join a group's chat room
socket.emit("joinGroup", groupId);
// Example: socket.emit("joinGroup", "507f1f77bcf86cd799439011");

// Send a message
socket.emit("sendMessage", {
  _id: "unique-message-id",
  content: "Hello everyone!",
  sender: "user-id",
  senderName: "John Doe",
  senderEmail: "john@example.com",
  groupId: "group-id",
  status: "sent",
  timestamp: new Date()
});

// Mark message as delivered
socket.emit("messageDelivered", {
  messageId: "message-id",
  groupId: "group-id"
});

// Mark message as read
socket.emit("messageRead", {
  messageId: "message-id",
  groupId: "group-id"
});
```

### **Backend → Frontend (Listeners)**

```javascript
socket.on("receiveMessage", (messageData) => {
  // Add message to UI
  // messageData = {...all message fields...}
});

socket.on("updateMessageStatus", (data) => {
  // Update status of message with id
  // data = { messageId, status: "delivered" | "read" }
});

socket.on("userJoined", (data) => {
  // Optional: Show "User joined" notification
  // data = { userId }
});
```

---

## 🚀 Deployment Checklist

When deploying to production:

- [ ] Update `MONGO_URI` in production database
- [ ] Update `CLIENT_URL` in backend `.env`
- [ ] Update socket connection URL in Chat.js
- [ ] Enable HTTPS for Socket.IO
- [ ] Set `secure: true` in Socket.IO config
- [ ] Configure CORS for production domain
- [ ] Test on real devices/browsers
- [ ] Monitor database performance
- [ ] Set up logging for socket events
- [ ] Add error handling for failed messages

---

## 📊 Performance Optimization Tips

1. **Message Pagination**: Load only last 50 messages, load more on scroll
2. **Message Indexing**: Add compound indexes on `groupId` and `createdAt`
3. **Socket Rooms**: Uses rooms efficiently (only sends to group members)
4. **Optimistic Updates**: Messages appear instantly without waiting for DB
5. **Auto-scroll**: Only when user is at bottom (check in handleSendMessage)

---

## 🐛 Debugging Tips

### **Check Socket Connection**
```javascript
// In browser console
console.log(socket.connected);  // Should be true
socket.on("connect", () => console.log("✓ Connected"));
socket.on("disconnect", () => console.log("✗ Disconnected"));
```

### **Log All Events**
```javascript
socket.onAny((event, ...args) => {
  console.log(`EVENT: ${event}`, args);
});
```

### **Check Database**
```bash
# In MongoDB Shell
use dbname
db.messages.find({groupId: "your-group-id"}).pretty()
```

---

## 📚 Useful Resources

- Socket.IO Documentation: https://socket.io/docs/
- MongoDB Schema Design: https://docs.mongodb.com/manual/
- React Hooks: https://react.dev/reference/react
- WhatsApp UI Inspiration: Look at their message bubbles and ticks

