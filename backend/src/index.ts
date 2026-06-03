import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import communityRoutes from './routes/communityRoutes';
import productRoutes from './routes/productRoutes';
import postRoutes from './routes/postRoutes';
import orderRoutes from './routes/orderRoutes';
import aiRoutes from './routes/aiRoutes';
import rewardRoutes from './routes/rewardRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import uploadRoutes from './routes/uploadRoutes';
import creatorRoutes from './routes/creatorRoutes';
import gamificationRoutes from './routes/gamificationRoutes';
import livestreamRoutes from './routes/livestreamRoutes';
import adminRoutes from './routes/adminRoutes';
import sellerRoutes from './routes/sellerRoutes';
import webhookRoutes from './routes/webhookRoutes';
import walletRoutes from './routes/walletRoutes';
import { initSocket } from './services/socketService';
import pool from './config/db';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

initSocket(io);

app.set('io', io); // Make io accessible in controllers

// Middleware - Webhook routes must come before JSON middleware for signature verification
app.use('/api/webhooks', webhookRoutes);

// Standard middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/products', productRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/livestreams', livestreamRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/wallet', walletRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Example: Join community room
  socket.on('join-community', (communityId) => {
    socket.join(`community-${communityId}`);
    console.log(`User joined community room: community-${communityId}`);
  });

  // Example: Leave community room
  socket.on('leave-community', (communityId) => {
    socket.leave(`community-${communityId}`);
    console.log(`User left community room: community-${communityId}`);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Unknown error',
  });
});

const PORT = process.env.PORT || 5000;

// Database connection check
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  } else {
    console.log('Database connected successfully');
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }
});
