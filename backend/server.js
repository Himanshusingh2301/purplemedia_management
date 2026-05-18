const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

if (process.env.NODE_ENV === 'production') {
  const weakJwt = !process.env.JWT_SECRET || process.env.JWT_SECRET === 'secret' || process.env.JWT_SECRET === 'change-this-in-production';
  if (weakJwt) {
    console.error('FATAL: Set a strong JWT_SECRET in production.');
    process.exit(1);
  }
  if (!process.env.MONGO_URI) {
    console.error('FATAL: MONGO_URI is required in production.');
    process.exit(1);
  }
}

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : process.env.CLIENT_URL
    ? [process.env.CLIENT_URL]
    : true;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('register', (userId) => {
    if (userId) socket.join(`user_${userId.toString()}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

// Middleware to inject io into requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Task Manager API' });
});

app.use('/api/*splat', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Optional: serve built frontend when deployed as monorepo
const frontendPath = path.join(__dirname, '../frontend/dist');
const hasFrontend = fs.existsSync(path.join(frontendPath, 'index.html'));

if (hasFrontend) {
  app.use(express.static(frontendPath));
  app.get('*splat', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'Task Manager API is running',
      docs: 'Point your frontend VITE_API_URL to this service /api',
    });
  });
}

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
