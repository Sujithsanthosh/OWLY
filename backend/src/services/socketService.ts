import { Server, Socket } from 'socket.io';

interface UserPresence {
  userId: string;
  userName: string;
  socketId: string;
  joinedAt: Date;
}

// Track user presence across rooms
const userPresenceByRoom: Record<string, Set<UserPresence>> = {};
const socketToUser: Record<string, UserPresence> = {};

export const initSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // ===== Community Room Handlers =====
    socket.on('join-community', (data: { communityId: string; userId: string; userName: string }) => {
      const roomId = `community-${data.communityId}`;
      socket.join(roomId);

      const presence: UserPresence = {
        userId: data.userId,
        userName: data.userName,
        socketId: socket.id,
        joinedAt: new Date(),
      };

      if (!userPresenceByRoom[roomId]) {
        userPresenceByRoom[roomId] = new Set();
      }
      userPresenceByRoom[roomId].add(presence);
      socketToUser[socket.id] = presence;

      io.to(roomId).emit('user-joined', {
        userId: data.userId,
        userName: data.userName,
        timestamp: new Date(),
        onlineCount: userPresenceByRoom[roomId].size,
      });

      console.log(`User ${data.userId} joined community: ${data.communityId}`);
    });

    socket.on('leave-community', (communityId: string) => {
      const roomId = `community-${communityId}`;
      socket.leave(roomId);

      if (userPresenceByRoom[roomId]) {
        userPresenceByRoom[roomId].forEach((presence) => {
          if (presence.socketId === socket.id) {
            userPresenceByRoom[roomId].delete(presence);

            io.to(roomId).emit('user-left', {
              userId: presence.userId,
              userName: presence.userName,
              timestamp: new Date(),
              onlineCount: userPresenceByRoom[roomId].size,
            });
          }
        });

        if (userPresenceByRoom[roomId].size === 0) {
          delete userPresenceByRoom[roomId];
        }
      }
    });

    // ===== Post Room Handlers =====
    socket.on('join-post', (postId: string) => {
      socket.join(`post-${postId}`);
    });

    socket.on('leave-post', (postId: string) => {
      socket.leave(`post-${postId}`);
    });

    // ===== Livestream Room Handlers =====
    socket.on('join-livestream', (data: { livestreamId: string; userId: string; userName: string }) => {
      const roomId = `livestream-${data.livestreamId}`;
      socket.join(roomId);

      const presence: UserPresence = {
        userId: data.userId,
        userName: data.userName,
        socketId: socket.id,
        joinedAt: new Date(),
      };

      if (!userPresenceByRoom[roomId]) {
        userPresenceByRoom[roomId] = new Set();
      }
      userPresenceByRoom[roomId].add(presence);
      socketToUser[socket.id] = presence;

      io.to(roomId).emit('viewer-joined', {
        userId: data.userId,
        userName: data.userName,
        timestamp: new Date(),
        viewerCount: userPresenceByRoom[roomId].size,
      });

      console.log(`User ${data.userId} joined livestream: ${data.livestreamId}`);
    });

    socket.on('leave-livestream', (livestreamId: string) => {
      const roomId = `livestream-${livestreamId}`;
      socket.leave(roomId);

      if (userPresenceByRoom[roomId]) {
        userPresenceByRoom[roomId].forEach((presence) => {
          if (presence.socketId === socket.id) {
            userPresenceByRoom[roomId].delete(presence);

            io.to(roomId).emit('viewer-left', {
              userId: presence.userId,
              timestamp: new Date(),
              viewerCount: userPresenceByRoom[roomId].size,
            });
          }
        });

        if (userPresenceByRoom[roomId].size === 0) {
          delete userPresenceByRoom[roomId];
        }
      }
    });

    // ===== Post Events =====
    socket.on('post-created', (data: { communityId: string; postId: string; post: any }) => {
      io.to(`community-${data.communityId}`).emit('post-created', {
        ...data,
        timestamp: new Date(),
      });
    });

    // ===== Like/Comment Events =====
    socket.on('like-added', (data: { postId: string; userId: string; likeCount: number }) => {
      io.to(`post-${data.postId}`).emit('like-added', {
        ...data,
        timestamp: new Date(),
      });
    });

    socket.on('like-removed', (data: { postId: string; userId: string; likeCount: number }) => {
      io.to(`post-${data.postId}`).emit('like-removed', {
        ...data,
        timestamp: new Date(),
      });
    });

    socket.on('comment-added', (data: { postId: string; comment: any }) => {
      io.to(`post-${data.postId}`).emit('comment-added', {
        ...data,
        timestamp: new Date(),
      });
    });

    socket.on('comment-deleted', (data: { postId: string; commentId: string }) => {
      io.to(`post-${data.postId}`).emit('comment-deleted', {
        ...data,
        timestamp: new Date(),
      });
    });

    // ===== Order Status Events =====
    socket.on('order-status-changed', (data: { orderId: string; userId: string; status: string }) => {
      io.to(`order-${data.orderId}`).emit('order-status-changed', {
        ...data,
        timestamp: new Date(),
      });
    });

    socket.on('join-order', (orderId: string) => {
      socket.join(`order-${orderId}`);
    });

    socket.on('leave-order', (orderId: string) => {
      socket.leave(`order-${orderId}`);
    });

    // ===== Livestream Events =====
    socket.on('livestream-started', (data: { livestreamId: string; title: string }) => {
      io.to(`livestream-${data.livestreamId}`).emit('livestream-started', {
        ...data,
        timestamp: new Date(),
      });
    });

    socket.on('livestream-ended', (data: { livestreamId: string }) => {
      io.to(`livestream-${data.livestreamId}`).emit('livestream-ended', {
        ...data,
        timestamp: new Date(),
      });
    });

    socket.on('product-pinned', (data: { livestreamId: string; productId: string; product: any }) => {
      io.to(`livestream-${data.livestreamId}`).emit('product-pinned', {
        ...data,
        timestamp: new Date(),
      });
    });

    socket.on('product-unpinned', (data: { livestreamId: string; productId: string }) => {
      io.to(`livestream-${data.livestreamId}`).emit('product-unpinned', {
        ...data,
        timestamp: new Date(),
      });
    });

    // ===== Livestream Comments =====
    socket.on('livestream-comment', (data: { livestreamId: string; userId: string; userName: string; comment: string }) => {
      io.to(`livestream-${data.livestreamId}`).emit('livestream-comment', {
        ...data,
        timestamp: new Date(),
      });
    });

    socket.on('livestream-reaction', (data: { livestreamId: string; userId: string; reaction: string }) => {
      io.to(`livestream-${data.livestreamId}`).emit('livestream-reaction', {
        ...data,
        timestamp: new Date(),
      });
    });

    // ===== Tip/Donation Events =====
    socket.on('tip-sent', (data: { livestreamId: string; senderId: string; senderName: string; amount: number; message?: string }) => {
      io.to(`livestream-${data.livestreamId}`).emit('tip-sent', {
        ...data,
        timestamp: new Date(),
      });
    });

    // ===== Typing Indicators =====
    socket.on('typing', (data: { roomId: string; roomType: string; userId: string; userName: string }) => {
      io.to(`${data.roomType}-${data.roomId}`).emit('user-typing', {
        userId: data.userId,
        userName: data.userName,
        timestamp: new Date(),
      });
    });

    socket.on('stop-typing', (data: { roomId: string; roomType: string; userId: string }) => {
      io.to(`${data.roomType}-${data.roomId}`).emit('user-stopped-typing', {
        userId: data.userId,
        timestamp: new Date(),
      });
    });

    // ===== Message Events =====
    socket.on('send-message', (data: { communityId: string; userId: string; userName: string; message: string }) => {
      io.to(`community-${data.communityId}`).emit('new-message', {
        userId: data.userId,
        userName: data.userName,
        message: data.message,
        timestamp: new Date(),
      });
    });

    // ===== Disconnect Handling =====
    socket.on('disconnect', () => {
      const presence = socketToUser[socket.id];
      if (presence) {
        // Clean up from all rooms
        Object.keys(userPresenceByRoom).forEach((roomId) => {
          userPresenceByRoom[roomId].forEach((p) => {
            if (p.socketId === socket.id) {
              userPresenceByRoom[roomId].delete(p);

              if (roomId.startsWith('community-')) {
                io.to(roomId).emit('user-left', {
                  userId: presence.userId,
                  userName: presence.userName,
                  timestamp: new Date(),
                  onlineCount: userPresenceByRoom[roomId].size,
                });
              } else if (roomId.startsWith('livestream-')) {
                io.to(roomId).emit('viewer-left', {
                  userId: presence.userId,
                  timestamp: new Date(),
                  viewerCount: userPresenceByRoom[roomId].size,
                });
              }
            }
          });

          if (userPresenceByRoom[roomId].size === 0) {
            delete userPresenceByRoom[roomId];
          }
        });

        delete socketToUser[socket.id];
      }

      console.log('User disconnected:', socket.id);
    });
  });

  // Helper function to get room viewer/member count
  io.on('get-room-count', (data: { roomId: string; roomType: string }) => {
    const fullRoomId = `${data.roomType}-${data.roomId}`;
    const count = userPresenceByRoom[fullRoomId]?.size || 0;
    io.to(fullRoomId).emit('room-count', { count });
  });
};
