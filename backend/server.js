const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

if (process.env.NODE_ENV === 'production') {
  if (!process.env.MONGO_URI) {
    console.error('FATAL: MONGO_URI is required in production.');
    process.exit(1);
  }
  const weakJwt =
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET === 'secret' ||
    process.env.JWT_SECRET === 'change-this-in-production';
  if (weakJwt) {
    console.error('FATAL: Set a strong JWT_SECRET in production.');
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
  socket.on('register', (userId) => {
    if (userId) socket.join(`user_${userId.toString()}`);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Task Manager API' });
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Task Manager API' });
});

app.use('/api/*splat', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager')
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
