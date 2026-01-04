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

4. **Configure Environment Variables**

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/videostream
JWT_SECRET=your_jwt_secret_key_here
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=123456
NODE_ENV=development
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

5. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

6. **Run the Application**

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

## 🔐 Environment Variables

### Backend Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Yes |
| `ADMIN_EMAIL` | Admin login email | Yes |
| `ADMIN_PASSWORD` | Admin login password | Yes |

### Frontend Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_FIREBASE_API_KEY` | Firebase API key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |

## 📡 API Documentation

### Authentication Endpoints

#### Register User (Firebase)
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Admin Login
```http
POST /api/auth/admin-login
Content-Type: application/json

{
  "email": "admin@admin.com",
  "password": "123456"
}
```

### Video Endpoints

#### Upload Video
```http
POST /api/videos/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <video_file>
title: "My Video"
```

#### Get User Videos
```http
GET /api/videos/user/:userId
Authorization: Bearer <token>
```

#### Stream Video
```http
GET /api/videos/stream/:videoId
Authorization: Bearer <token>
Range: bytes=0-1024
```

#### Delete Video
```http
DELETE /api/videos/:videoId
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get All Videos
```http
GET /api/admin/videos
Authorization: Bearer <admin_token>
```

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

#### Update User Role
```http
PATCH /api/admin/users/:userId/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "editor"
}
```

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

## 📦 Deployment

### Backend Deployment (Heroku)

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create videostream-backend

# Add MongoDB Atlas addon or use existing cluster
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set FIREBASE_PROJECT_ID=your_project_id

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Set environment variables in Vercel dashboard
# VITE_API_URL=https://your-backend.herokuapp.com
```

## 🎯 Key Features Implementation

### Real-Time Processing
```javascript
// Socket.IO implementation for live updates
io.on('connection', (socket) => {
  socket.on('video:upload', (data) => {
    // Emit progress updates
    socket.emit('upload:progress', { progress: 50 });
  });
});
```

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

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

## 🙏 Acknowledgments

- React and Vite for the modern frontend framework
- Express.js for robust backend API
- MongoDB for flexible data storage
- Firebase for secure authentication
- Socket.IO for real-time communication
- Lucide React for beautiful icons
- Tailwind CSS for responsive styling

## 📞 Support

For support, email support@videostream.com or open an issue in the repository.

---

**Built with ❤️ for the Full-Stack Developer Community**
