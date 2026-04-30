import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import aiRoutes from './routes/aiRoutes';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// CORS configuration for Socket.io and Express
const corsOptions = {
  origin: '*', // For development. Adjust to frontend URL in production
  methods: ['GET', 'POST']
};

app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use('/api/ai', aiRoutes);

// Initialize Socket.io
const io = new Server(server, {
  cors: corsOptions
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Broadcast node changes (drag, select, property updates)
  socket.on('nodes-change', (changes) => {
    // broadcast to everyone EXCEPT the sender
    socket.broadcast.emit('nodes-change', changes);
  });

  // Broadcast edge changes
  socket.on('edges-change', (changes) => {
    socket.broadcast.emit('edges-change', changes);
  });

  // Broadcast new connection
  socket.on('connect-edge', (connection) => {
    socket.broadcast.emit('connect-edge', connection);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NetCanvas AI Backend is running' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
