# Software Requirements Specification (SRS)
## SquadUp - Group Chat Application

---

## Project Team

| Name | Enrollment ID |
|------|---------------|
| Hetvi Undhad | 24CE131 |
| Shreeji Sojitra | 24CE119 |
| Riya Thesia | 24CE126 |
| Siya Thakkar | 24CE125 |

---

## Introduction

Software Project Management ensures that a software product is delivered on time, within budget, and with expected quality. It works in parallel with the Software Development Life Cycle (SDLC). While SDLC focuses on how software is built, Project Management focuses on how the project is planned, executed, and controlled.

### Software Development Life Cycle (SDLC)

SDLC is a systematic process used to develop software. It defines different phases involved in building a software product from start to end.

- Requirement Analysis
- Design
- Implementation (Coding)
- Testing
- Deployment
- Maintenance

### Project Management Life Cycle (PMLC)

Project Management Life Cycle focuses on managing the project activities effectively. It ensures proper planning, resource utilization, monitoring, and successful completion of the project.

- Initiation
- Planning
- Execution
- Monitoring and Controlling
- Closure

### Parallel Execution of SDLC and PMLC

In real software projects, SDLC and Project Management Life Cycle run in parallel. SDLC handles technical development, while Project Management ensures the work is completed efficiently and systematically.

- Initiation aligns with Requirement Identification
- Planning aligns with Requirement Analysis and Design
- Execution aligns with Coding and Testing
- Monitoring aligns with Reviews and Quality Checks
- Closure aligns with Deployment and Maintenance

---

## Project: SquadUp - Group Chat Application

---

## 1. Initiation ↔ Requirement Identification

### 🟢 Activity 1: Project Kickoff

**Duration:** 5–7 minutes

**Project Overview:**

**Who are the users?**
- Students
- College Groups
- Team Members
- Group Administrators

**What problem does this project solve?**
- Enables real-time group communication for college students and teams
- Facilitates file sharing and collaboration
- Provides organized group management with admin controls
- Allows secure authentication and member invitation system

**5 Basic Requirements:**
1. User registration with OTP verification
2. Create and manage groups
3. Send text messages, photos, videos, and documents in real-time
4. Invite members to groups via email
5. Admin can add/remove members from groups

**Expected Output:**
- **Users:** Students, Group Members, Group Admins
- **Requirements:**
  - User authentication (Register/Login)
  - Create groups
  - Real-time chat with file sharing
  - Email-based group invitations
  - Admin panel for member management

**🎯 Concept Learned:**
Project starts with idea + requirements

---

## 2. Planning ↔ Requirement Analysis & Design Planning

### 🟢 Activity 2: Plan the Project

**Duration:** 8–10 minutes

**Project Planning:**

**Modules:**
1. Authentication Module
   - User Registration with OTP
   - Login
   - Forgot Password
2. Group Management Module
   - Create Group
   - Invite Members
   - Add/Remove Members
   - View Group Details
3. Chat Module
   - Send Text Messages
   - Upload Files (Photos, Videos, Documents)
   - Real-time Message Delivery
   - Message Status (Sent/Delivered/Read)
4. Dashboard Module
   - View All Groups
   - User Profile
   - Statistics

**Team Size:** 4 members

**Team Members:**
- Hetvi Undhad (24CE131)
- Shreeji Sojitra (24CE119)
- Riya Thesia (24CE126)
- Siya Thakkar (24CE125)

**Estimated Duration:** 6 weeks

**Technology Stack:**
- Frontend: React.js
- Backend: Node.js + Express.js
- Database: MongoDB
- Real-time: Socket.IO
- Email Service: Nodemailer

**🎯 Concept Learned:**
Planning happens before coding

---

## 3. Estimation ↔ Requirement Analysis

### 🟢 Activity 3: Effort Estimation

**Duration:** 5–7 minutes

**Effort Estimation Table:**

| Module | Sub-Module | Estimated Days |
|--------|-----------|----------------|
| **Authentication** | Register with OTP | 4 |
| | Login | 2 |
| | Forgot Password | 2 |
| **Group Management** | Create Group | 3 |
| | Invite Members | 4 |
| | Add/Remove Members | 3 |
| | Group Details | 2 |
| **Chat Module** | Text Messaging | 5 |
| | File Upload | 4 |
| | Real-time Socket.IO | 5 |
| | Message Status | 3 |
| **Dashboard** | User Dashboard | 3 |
| | Profile Management | 2 |
| **Testing & Deployment** | Testing | 4 |
| | Deployment | 2 |
| **Total** | | **48 days (~7 weeks)** |

**🎯 Concept Learned:**
Estimation predicts time and effort

---

## 4. Execution ↔ Coding & Testing

### 🟢 Activity 4: Build One Feature

**Duration:** 10 minutes

**Feature: Real-time Chat with File Upload**

**Flowchart:**
```
Start
  ↓
User Opens Group Chat
  ↓
Load Previous Messages from Database
  ↓
Connect to Socket.IO Server
  ↓
User Types Message OR Selects File
  ↓
[Decision: Text or File?]
  ↓                    ↓
Text Message        File Upload
  ↓                    ↓
Send to Server      Upload to Server
  ↓                    ↓
Save to Database    Save File & Create Message
  ↓                    ↓
Broadcast via Socket.IO
  ↓
All Group Members Receive Message
  ↓
Display in Chat
  ↓
Update Message Status (Sent → Delivered → Read)
  ↓
End
```

**Pseudocode:**
```
FUNCTION sendMessage(content, groupId, userId):
    IF content is empty:
        RETURN error
    
    message = {
        content: content,
        sender: userId,
        groupId: groupId,
        timestamp: currentTime
    }
    
    savedMessage = database.save(message)
    socket.emit("sendMessage", savedMessage)
    RETURN success

FUNCTION uploadFile(file, groupId, userId):
    IF file size > 50MB:
        RETURN error
    
    uploadedFile = storage.save(file)
    
    message = {
        content: file.name,
        fileUrl: uploadedFile.url,
        fileType: file.type,
        sender: userId,
        groupId: groupId
    }
    
    savedMessage = database.save(message)
    socket.emit("sendMessage", savedMessage)
    RETURN success
```

**🎯 Concept Learned:**
Execution = actual development work

---

## 5. Monitoring & Controlling ↔ Review & Testing

### 🟢 Activity 5: Track the Project

**Duration:** 5–7 minutes

**Project Tracking Table:**

| Module | Planned Days | Actual Days | Status | Variance |
|--------|-------------|-------------|--------|----------|
| Register with OTP | 4 | 5 | Completed | +1 |
| Login | 2 | 2 | Completed | 0 |
| Forgot Password | 2 | 3 | Completed | +1 |
| Create Group | 3 | 3 | Completed | 0 |
| Invite Members | 4 | 5 | Completed | +1 |
| Add/Remove Members | 3 | 3 | Completed | 0 |
| Text Messaging | 5 | 6 | Completed | +1 |
| File Upload | 4 | 5 | Completed | +1 |
| Socket.IO Integration | 5 | 7 | Completed | +2 |
| Message Status | 3 | 4 | Completed | +1 |
| Dashboard | 3 | 3 | Completed | 0 |
| Testing | 4 | 5 | In Progress | +1 |

**Identified Issues:**
- Delay in Socket.IO integration (+2 days)
- File upload took longer due to validation requirements (+1 day)
- OTP email service configuration delay (+1 day)

**Corrective Actions:**
- Added extra developer for Socket.IO debugging
- Extended testing phase by 1 day
- Implemented better error handling for file uploads
- Used environment variables for email configuration

**🎯 Concept Learned:**
Tracking helps control project deviation

---

## 6. Closure ↔ Deployment & Maintenance

### 🟢 Activity 6: Project Closure

**Duration:** 5 minutes

**Final Deliverables:**
1. **Source Code**
   - Frontend React application
   - Backend Node.js API
   - Database schemas and models
2. **Documentation**
   - User Manual
   - API Documentation
   - Installation Guide
   - README.md
3. **Database**
   - MongoDB collections (Users, Groups, Messages, Files)
   - Sample data for testing
4. **Deployment Files**
   - Environment configuration files
   - Docker configuration (optional)
   - Deployment scripts

**Maintenance Activities:**
1. **Bug Fixes**
   - Fix reported issues
   - Handle edge cases
   - Security patches
2. **Feature Enhancements**
   - Add emoji support
   - Voice message feature
   - Video call integration
   - Message search functionality
3. **Performance Optimization**
   - Database query optimization
   - File compression
   - Caching implementation
4. **Regular Updates**
   - Dependency updates
   - Security updates
   - MongoDB backup and restore

**🎯 Concept Learned:**
Project doesn't end after coding

---

## 7. Final Integration Activity

### 🟢 Activity 7: Phase Mapping

**Duration:** 3 minutes 👉 Revision

**Match Activity to Phase:**

| Activity | Phase |
|----------|-------|
| Identifying user needs and requirements | Initiation |
| Estimating development time for modules | Planning |
| Writing Socket.IO connection code | Execution |
| Testing file upload functionality | Monitoring |
| Creating user manual and deployment | Closure |
| Designing database schema | Planning |
| Implementing authentication with OTP | Execution |
| Tracking delays in development | Monitoring |
| Defining project scope and objectives | Initiation |
| Deploying to production server | Closure |

**🎯 Concept Learned:**
Clear end-to-end understanding

---

## Functional Requirements

### 1. User Authentication
- FR1.1: System shall allow users to register with email and OTP verification
- FR1.2: System shall allow users to login with email and password
- FR1.3: System shall provide forgot password functionality
- FR1.4: System shall maintain user sessions using JWT tokens

### 2. Group Management
- FR2.1: Users shall be able to create new groups
- FR2.2: Group admin shall be able to invite members via email
- FR2.3: Group admin shall be able to add/remove members
- FR2.4: Users shall be able to view group details and member list
- FR2.5: Users shall be able to leave groups (except admin)

### 3. Chat Functionality
- FR3.1: Users shall be able to send text messages in real-time
- FR3.2: Users shall be able to upload and share files (photos, videos, documents)
- FR3.3: System shall display message status (sent, delivered, read)
- FR3.4: Messages shall persist in database
- FR3.5: Users shall be able to download shared files

### 4. Dashboard
- FR4.1: Users shall see all their groups on dashboard
- FR4.2: Users shall see group statistics (member count, admin)
- FR4.3: Users shall be able to navigate to group chat

---

## Non-Functional Requirements

### 1. Performance
- NFR1.1: Messages shall be delivered in real-time (< 1 second)
- NFR1.2: File upload shall support files up to 50MB
- NFR1.3: System shall support 100+ concurrent users

### 2. Security
- NFR2.1: Passwords shall be encrypted using bcrypt
- NFR2.2: API endpoints shall be protected with JWT authentication
- NFR2.3: File uploads shall be validated for type and size

### 3. Usability
- NFR3.1: Interface shall be responsive and mobile-friendly
- NFR3.2: System shall provide clear error messages
- NFR3.3: UI shall follow modern design principles

### 4. Reliability
- NFR4.1: System shall have 99% uptime
- NFR4.2: Database shall be backed up daily
- NFR4.3: System shall handle connection failures gracefully

---

## 5. Other Nonfunctional Requirements

### 5.1 Performance Requirements

**PR-1: Response Time**
- The system shall load the dashboard within 2 seconds on a standard broadband connection
- Chat messages shall be sent and received within 1 second under normal network conditions
- File uploads shall show progress indicator and complete within 10 seconds for files up to 10MB

**PR-2: Throughput**
- The system shall handle at least 100 concurrent users without performance degradation
- The system shall support 1000+ messages per minute across all groups
- Socket.IO server shall maintain 500+ active WebSocket connections simultaneously

**PR-3: Capacity**
- Database shall store up to 1 million messages without performance impact
- File storage shall support up to 100GB of uploaded files
- Each group shall support up to 100 members

**PR-4: Scalability**
- System architecture shall allow horizontal scaling by adding more server instances
- MongoDB shall support sharding for future growth
- Load balancer shall distribute traffic across multiple backend servers

### 5.2 Safety Requirements

**SF-1: Data Backup**
- MongoDB database shall be backed up automatically every 24 hours
- Backup retention period shall be 30 days
- Uploaded files shall be backed up to secondary storage weekly

**SF-2: Data Recovery**
- System shall provide database restore functionality within 1 hour
- In case of server failure, system shall recover to last known stable state
- Message history shall be recoverable from backups

**SF-3: Error Handling**
- System shall gracefully handle network disconnections and reconnect automatically
- File upload failures shall not corrupt existing data
- Invalid user inputs shall be rejected with appropriate error messages

**SF-4: Data Integrity**
- All database transactions shall follow ACID properties
- Message delivery shall be guaranteed (no message loss)
- File uploads shall be verified for completeness before saving

**SF-5: Failover Mechanism**
- System shall detect server failures within 30 seconds
- Automatic failover to backup server shall occur within 1 minute
- Users shall be notified of temporary service interruptions

### 5.3 Security Requirements

**SEC-1: Authentication**
- Users shall authenticate using email and password
- Passwords shall be hashed using bcrypt with salt rounds of 10
- OTP verification shall be required for new user registration
- JWT tokens shall expire after 7 days and require re-login

**SEC-2: Authorization**
- Only group members shall access group chat and files
- Only group admin shall add/remove members
- Users shall only access their own profile and groups
- API endpoints shall verify user permissions before granting access

**SEC-3: Data Encryption**
- Passwords shall be encrypted before storing in database
- JWT tokens shall be signed with secret key
- HTTPS shall be used for all client-server communication (in production)
- Sensitive data in .env file shall not be committed to version control

**SEC-4: Input Validation**
- All user inputs shall be validated on both client and server side
- File uploads shall be restricted to allowed file types (.pdf, .doc, .jpg, .png, .mp4, etc.)
- File size shall be limited to 50MB maximum
- SQL injection and XSS attacks shall be prevented through input sanitization

**SEC-5: Session Management**
- User sessions shall timeout after 7 days of inactivity
- Multiple concurrent sessions shall be allowed per user
- Logout shall invalidate the current session token
- Session data shall be stored securely

**SEC-6: Privacy**
- User email addresses shall not be publicly visible
- Only group members shall see other members' information
- Deleted messages shall be permanently removed from database
- User data shall not be shared with third parties

### 5.4 Software Quality Attributes

**SQA-1: Reliability**
- System uptime shall be 99% or higher
- Mean Time Between Failures (MTBF) shall be at least 720 hours (30 days)
- Mean Time To Repair (MTTR) shall be less than 1 hour
- System shall handle errors gracefully without crashing

**SQA-2: Availability**
- System shall be available 24/7 except during scheduled maintenance
- Scheduled maintenance shall occur during low-traffic hours (2 AM - 4 AM)
- Users shall be notified 24 hours before scheduled maintenance
- Maximum planned downtime shall be 2 hours per month

**SQA-3: Maintainability**
- Code shall follow consistent naming conventions and style guidelines
- Each module shall be well-documented with comments
- Code shall be modular and follow separation of concerns
- Version control (Git) shall be used for all code changes
- Bug fixes shall be deployable within 24 hours

**SQA-4: Portability**
- Frontend shall work on Chrome, Firefox, Safari, and Edge browsers
- Application shall be responsive and work on desktop, tablet, and mobile devices
- Backend shall run on Windows, Linux, and macOS
- Database shall be portable across different MongoDB hosting services

**SQA-5: Usability**
- New users shall be able to register and create a group within 5 minutes
- Interface shall be intuitive and require minimal training
- Error messages shall be clear and actionable
- Help documentation shall be provided for all major features
- UI shall follow accessibility standards (WCAG 2.1 Level AA)

**SQA-6: Testability**
- Each module shall have unit tests with minimum 70% code coverage
- API endpoints shall be testable using Postman or similar tools
- Integration tests shall verify end-to-end workflows
- Test data shall be separate from production data

**SQA-7: Reusability**
- Common components (buttons, forms, modals) shall be reusable
- Backend middleware shall be modular and reusable
- Database models shall be well-defined and reusable
- Utility functions shall be centralized in helper files

**SQA-8: Interoperability**
- System shall integrate with Gmail SMTP for sending emails
- REST API shall follow standard HTTP methods (GET, POST, PUT, DELETE)
- WebSocket communication shall use Socket.IO protocol
- File storage shall be compatible with cloud storage services (AWS S3, Google Cloud)

**SQA-9: Efficiency**
- Database queries shall be optimized with proper indexing
- Images shall be compressed before storage
- Lazy loading shall be implemented for message history
- Caching shall be used for frequently accessed data

**SQA-10: Flexibility**
- System shall allow easy addition of new features
- Configuration shall be managed through environment variables
- Database schema shall support future extensions
- API versioning shall be supported for backward compatibility

---

## System Architecture

### Technology Stack
- **Frontend:** React.js, Socket.IO Client, Axios
- **Backend:** Node.js, Express.js, Socket.IO Server
- **Database:** MongoDB
- **Authentication:** JWT, bcrypt
- **Email Service:** Nodemailer (Gmail SMTP)
- **File Storage:** Local file system (/uploads directory)

### Database Schema

**Users Collection:**
- _id, fullName, email, password, enrollment, course, semester, college, isVerified, createdAt

**Groups Collection:**
- _id, name, admin (ref: User), members (ref: User[]), createdAt

**Messages Collection:**
- _id, content, sender (ref: User), senderName, senderEmail, groupId (ref: Group), fileUrl, fileType, status, timestamp, createdAt

**Files Collection:**
- _id, groupId (ref: Group), filename, originalName, fileUrl, fileType, fileSize, uploadedBy, uploadedByEmail, createdAt

---

## Conclusion

The SquadUp Group Chat Application successfully demonstrates the parallel execution of SDLC and PMLC. The project was completed following systematic phases from initiation to closure, ensuring proper planning, execution, monitoring, and delivery. The application provides a robust platform for group communication with real-time messaging, file sharing, and comprehensive group management features.

**Project Success Metrics:**
- ✅ All functional requirements implemented
- ✅ Real-time communication working
- ✅ Secure authentication system
- ✅ File sharing and persistence
- ✅ Responsive user interface
- ✅ Deployed and operational

**Future Enhancements:**
- Voice and video calling
- Message reactions and emoji support
- Message search and filtering
- Group video conferencing
- Mobile application (React Native)

---

**Document Version:** 1.0  
**Date:** January 2025  
**Project Status:** Completed  

**Prepared By:**
- Hetvi Undhad (24CE131)
- Shreeji Sojitra (24CE119)
- Riya Thesia (24CE126)
- Siya Thakkar (24CE125)
