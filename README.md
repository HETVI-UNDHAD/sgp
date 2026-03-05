# SquadUp - Team Collaboration Platform

A full-stack MERN application for team collaboration with real-time chat, file sharing, and video calling.

## Features

- 🔐 User Authentication (Register, Login, OTP Verification)
- 👥 Group Management (Create, Join, Manage Members)
- 💬 Real-time Chat with Socket.IO
- 📁 File Sharing (Documents, Photos, Videos)
- 📹 Video Call Integration with Email Invitations
- 📧 Email Notifications
- 🔔 Real-time Notifications

## Tech Stack

**Frontend:**
- React.js
- React Router
- Socket.IO Client
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB
- Socket.IO
- Nodemailer

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- Gmail account for email service

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

4. Start backend:
```bash
npm start
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5001
```

4. Start frontend:
```bash
npm start
```

## Usage

1. Register a new account
2. Verify email with OTP
3. Create or join groups
4. Start chatting and sharing files
5. Initiate video calls with group members

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5001)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `EMAIL_USER` - Gmail address for sending emails
- `EMAIL_PASS` - Gmail app password

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL

## License

MIT
