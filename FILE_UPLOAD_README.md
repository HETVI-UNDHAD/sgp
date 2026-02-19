# File Upload & Download Feature

## Overview
Full-stack file sharing system for group chats with real-time updates using Socket.IO.

## Features
- ✅ File upload (images, PDFs, Word docs, etc.)
- ✅ 10MB file size limit
- ✅ File type validation
- ✅ Real-time broadcast via Socket.IO
- ✅ Image preview in chat
- ✅ Download functionality
- ✅ Group-based access control
- ✅ Local file storage in `uploads/` folder

## Backend Setup

### Dependencies Installed
```bash
npm install multer socket.io
```

### Files Created/Modified
1. **models/File.js** - MongoDB schema for file metadata
2. **routes/fileRoutes.js** - Upload/download API endpoints
3. **server.js** - Socket.IO integration

### API Endpoints
- `POST /api/files/upload` - Upload file (requires: file, groupId, userEmail)
- `GET /api/files/group/:groupId` - Get all files for a group
- `GET /api/files/download/:id` - Download file by ID

### Security Features
- File size validation (10MB max)
- File type whitelist (images, PDFs, docs)
- Group membership verification
- Secure file storage with unique names

## Frontend Setup

### Dependencies Installed
```bash
npm install socket.io-client
```

### Files Created
1. **GroupChat.js** - Main chat component with file upload/download
2. **socket.js** - Socket.IO client utility

### Routes Added
- `/chat/:groupId` - Group chat with file sharing

## Usage

1. Navigate to a group details page
2. Click "Open Chat" button
3. Click "📎 Upload File" to select and upload files
4. Files appear in real-time for all group members
5. Click "⬇ Download" to download any file

## File Storage
Files are stored locally in `backend/uploads/` directory with unique names to prevent conflicts.

## Socket.IO Events
- `joinGroup` - User joins a group room
- `fileUploaded` - Broadcast new file to group
- `newFile` - Receive new file notification

## Future Enhancements
- AWS S3 / Firebase Storage integration
- File deletion by uploader
- Progress bar for uploads
- File search/filter
- Thumbnail generation
