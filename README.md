# Video Streaming Platform

A real-time video streaming platform built with WebRTC and MediaSoup, featuring a Next.js frontend and Node.js backend.

## Features

- **Real-time Video Streaming**: High-quality video streaming using WebRTC technology
- **MediaSoup Integration**: Selective Forwarding Unit (SFU) for efficient multi-party video calls
- **Stream Broadcasting**: Users can broadcast their camera/screen to multiple viewers
- **Watch Mode**: Viewers can watch live streams without broadcasting
- **Socket.io Communication**: Real-time bidirectional event-based communication
- **TypeScript Support**: Full TypeScript support for better development experience

## Tech Stack

### Frontend
- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **MediaSoup Client** - WebRTC client library
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MediaSoup** - SFU
- **Socket.io** - WebSocket communication
- **CORS** - Cross-origin resource sharing

## Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **Web browser** with WebRTC support (Chrome, Firefox, Safari, Edge)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yogayataverma/WebRTC-Conference.git 
```

### 2. Install Dependencies

**Backend:**
```bash
git checkout backend
npm install
```

**Frontend:**
```bash
git checkout frontend
npm install
```

**Start Backend Server:**
```bash
cd server
npm start
```

**Start Frontend Development Server:**
```bash
cd client/fermion
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000

## How to Use

### For Streamers:
1. Navigate to the **Stream** page
2. Enter your username
3. Allow camera/microphone permissions
4. Click "Start Streaming" to begin broadcasting
5. Share your stream with viewers

### For Viewers:
1. Navigate to the **Watch** page
2. Browse available live streams
3. Click on any stream to start watching
4. Enjoy real-time video content

## API Endpoints

### Socket.io Events

**Client to Server:**
- `setUserName` - Set user display name
- `getAvailableProducers` - Get list of active streams
- `createTransport` - Create WebRTC transport
- `produce` - Start producing media
- `consume` - Start consuming media

**Server to Client:**
- `connect` - Connection established
- `disconnect` - Connection lost
- `newProducer` - New stream available
- `producerClosed` - Stream ended

**Happy Streaming!**
