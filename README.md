# 🎥 VideoStream Platform

A comprehensive full-stack video upload, sensitivity processing, and streaming application with role-based access control (RBAC) and multi-tenant architecture.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-6.0-green.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [User Roles & Permissions](#user-roles--permissions)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🌟 Overview

VideoStream is a modern video management platform that enables users to upload videos, automatically process them for content sensitivity analysis, and stream them securely with real-time progress tracking. The application implements enterprise-grade features including multi-tenant architecture, role-based access control, and real-time updates using Socket.IO.

## ✨ Features

### Core Functionality
- **Video Upload & Management** - Drag-and-drop interface with file validation and progress tracking
- **Content Sensitivity Analysis** - Automated video screening with safe/flagged classification
- **Real-Time Processing Updates** - Live progress tracking via Socket.IO
- **Video Streaming** - HTTP range request support for efficient video delivery
- **Multi-Tenant Architecture** - Secure user isolation and data segregation
- **Role-Based Access Control** - Three-tier permission system (Viewer, Editor, Admin)

### Advanced Features
- **Firebase Authentication** - Secure user signup and login
- **Admin Panel** - Comprehensive user and video management dashboard
- **Responsive Design** - Modern glassmorphism UI with mobile support
- **Video Filtering** - Filter by status, sensitivity, and metadata
- **Real-Time Dashboard** - Dynamic statistics and status indicators

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (LTS version)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Real-Time:** Socket.IO
- **Authentication:** Firebase Admin SDK + JWT
- **File Handling:** Multer
- **Video Processing:** FFmpeg

### Frontend
- **Build Tool:** Vite
- **Framework:** React 18
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Real-Time:** Socket.IO Client

### Infrastructure
- **File Storage:** Local/AWS S3
- **Database Hosting:** MongoDB Atlas
- **Deployment:** Vercel/Netlify (Frontend), Heroku (Backend)

## 🏗️ Architecture

```
video-platform/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── firebase.js           # Firebase Admin setup
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   └── upload.js             # Multer configuration
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Video.js              # Video schema
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── users.js              # User management
│   │   └── videos.js             # Video operations
│   ├── uploads/                  # Video storage
│   ├── .env                      # Environment variables
│   ├── server.js                 # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Landing.jsx       # Landing page
│   │   │   ├── Auth.jsx          # Login/Signup
│   │   │   ├── Dashboard.jsx    # User dashboard
│   │   │   └── AdminPanel.jsx   # Admin interface
│   │   ├── services/
│   │   │   ├── api.js            # API client
│   │   │   └── socket.js         # Socket.IO client
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx
│   ├── .env                      # Frontend env vars
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- Firebase Project Setup
- FFmpeg installed (for video processing)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/videostream-platform.git
cd videostream-platform
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

**Run the Application**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

7. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health


## 👥 User Roles & Permissions

### Viewer
- ✅ View assigned videos
- ✅ Stream video content
- ❌ Upload videos
- ❌ Edit content
- ❌ Manage users

### Editor
- ✅ View own videos
- ✅ Upload videos
- ✅ Edit own content
- ✅ Delete own videos
- ❌ View other users' videos
- ❌ Manage users

### Admin
- ✅ Full system access
- ✅ View all videos across platform
- ✅ Manage all users
- ✅ Change user roles
- ✅ Delete any video or user
- ✅ Access admin panel

**Default Admin Credentials:**
- Email: `admin@admin.com`
- Password: `123456`

## 🧪 Testing

### Test Scenarios

1. **User Registration & Authentication**
```bash
# Test user signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@user.com","password":"password123"}'
```

2. **Video Upload (as Editor)**
```bash
# Upload video with authentication
curl -X POST http://localhost:5000/api/videos/upload \
  -H "Authorization: Bearer <your_token>" \
  -F "file=@video.mp4" \
  -F "title=Test Video"
```

3. **Admin Operations**
```bash
# Get all users (admin only)
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer <admin_token>"
```

### Manual Testing Checklist

- [ ] Landing page loads correctly
- [ ] User signup with Firebase works
- [ ] User login successful
- [ ] Admin login with default credentials
- [ ] Viewer role: No upload access
- [ ] Editor role: Can upload videos
- [ ] Video upload shows real-time progress
- [ ] Sensitivity analysis completes (safe/flagged)
- [ ] Video streaming works
- [ ] Admin can view all videos
- [ ] Admin can manage user roles
- [ ] Multi-tenant isolation verified


## 🎯 Key Features Implementation

### Sensitivity Analysis
- Automated content screening
- Safe/Flagged classification
- Visual status indicators
- Admin review capabilities

### Multi-Tenant Architecture
- User-specific video libraries
- Secure data isolation
- Role-based access control
- Per-user authentication

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Shaikh Rayyan Ahmed**
- LinkedIn:([https://linkedin.com/in/yourprofile](https://www.linkedin.com/in/bytexpert/?lipi=urn%3Ali%3Apage%3Ad_flagship3_people%3BEaQT59KDR9i1grjV1YMMtg%3D%3D))
- Email: shaikhrayyanofficial@gmail.com

## 🙏 Acknowledgments

- React and Vite for the modern frontend framework
- Express.js for robust backend API
- MongoDB for flexible data storage
- Firebase for secure authentication
- Socket.IO for real-time communication
- Lucide React for beautiful icons
- Tailwind CSS for responsive styling
