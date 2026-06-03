import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responses';
import pool from '../config/db';

export interface AuthRequest extends Request {
  user?: any;
}

// Create livestream
export const createLivestream = async (req: AuthRequest, res: Response) => {
  try {
    const { community_id, title, description, scheduled_start_time } = req.body;
    const host_id = req.user?.userId;

    if (!host_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!title || !community_id) {
      return sendError(res, null, 'Title and community_id are required', 400);
    }

    const result = await pool.query(
      `INSERT INTO livestreams (host_id, community_id, title, description, status, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, host_id, community_id, title, description, status, thumbnail_url, viewer_count, started_at, ended_at, created_at`,
      [host_id, community_id, title, description || null, 'upcoming']
    );

    const livestream = result.rows[0];

    return sendSuccess(res, livestream, 'Livestream created successfully', 201);
  } catch (error) {
    console.error('Create livestream error:', error);
    return sendError(res, error, 'Failed to create livestream', 500);
  }
};

// List livestreams (with optional filters)
export const listLivestreams = async (req: Request, res: Response) => {
  try {
    const { status = 'all', community_id, page = 1, limit = 20 } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    let query = `
      SELECT l.*, u.name as host_name, u.avatar_url as host_avatar, c.name as community_name
      FROM livestreams l
      JOIN users u ON l.host_id = u.id
      JOIN communities c ON l.community_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status !== 'all') {
      params.push(status);
      query += ` AND l.status = $${params.length}`;
    }

    if (community_id) {
      params.push(community_id);
      query += ` AND l.community_id = $${params.length}`;
    }

    query += ` ORDER BY l.started_at DESC NULLS LAST, l.created_at DESC
               LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return sendSuccess(res, {
      livestreams: result.rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('List livestreams error:', error);
    return sendError(res, error, 'Failed to list livestreams', 500);
  }
};

// Get livestream details
export const getLivestream = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT l.*, u.name as host_name, u.avatar_url as host_avatar, c.name as community_name
       FROM livestreams l
       JOIN users u ON l.host_id = u.id
       JOIN communities c ON l.community_id = c.id
       WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'Livestream not found', 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    console.error('Get livestream error:', error);
    return sendError(res, error, 'Failed to get livestream', 500);
  }
};

// Start livestream
export const startLivestream = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const host_id = req.user?.userId;

    if (!host_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    // Verify ownership
    const checkResult = await pool.query('SELECT host_id FROM livestreams WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return sendError(res, null, 'Livestream not found', 404);
    }

    if (checkResult.rows[0].host_id !== host_id) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    const result = await pool.query(
      `UPDATE livestreams
       SET status = $1, started_at = NOW(), viewer_count = 0
       WHERE id = $2
       RETURNING id, status, started_at, viewer_count`,
      ['live', id]
    );

    const livestream = result.rows[0];

    // Emit socket event
    const io = (req.app as any).get('io');
    if (io) {
      io.to(`livestream-${id}`).emit('livestream-started', {
        livestreamId: id,
        timestamp: new Date(),
      });
    }

    return sendSuccess(res, livestream, 'Livestream started', 200);
  } catch (error) {
    console.error('Start livestream error:', error);
    return sendError(res, error, 'Failed to start livestream', 500);
  }
};

// End livestream
export const endLivestream = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const host_id = req.user?.userId;

    if (!host_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    // Verify ownership
    const checkResult = await pool.query('SELECT host_id FROM livestreams WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return sendError(res, null, 'Livestream not found', 404);
    }

    if (checkResult.rows[0].host_id !== host_id) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    const result = await pool.query(
      `UPDATE livestreams
       SET status = $1, ended_at = NOW()
       WHERE id = $2
       RETURNING id, status, started_at, ended_at, viewer_count`,
      ['ended', id]
    );

    const livestream = result.rows[0];

    // Emit socket event
    const io = (req.app as any).get('io');
    if (io) {
      io.to(`livestream-${id}`).emit('livestream-ended', {
        livestreamId: id,
        timestamp: new Date(),
      });
    }

    return sendSuccess(res, livestream, 'Livestream ended', 200);
  } catch (error) {
    console.error('End livestream error:', error);
    return sendError(res, error, 'Failed to end livestream', 500);
  }
};

// Pin product during livestream
export const pinProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { product_id } = req.body;
    const host_id = req.user?.userId;

    if (!host_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!product_id) {
      return sendError(res, null, 'product_id is required', 400);
    }

    // Verify livestream ownership
    const livestreamCheck = await pool.query(
      'SELECT host_id FROM livestreams WHERE id = $1',
      [id]
    );
    if (livestreamCheck.rows.length === 0) {
      return sendError(res, null, 'Livestream not found', 404);
    }

    if (livestreamCheck.rows[0].host_id !== host_id) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    // Get product details
    const productCheck = await pool.query(
      'SELECT id, name, price, images FROM products WHERE id = $1',
      [product_id]
    );
    if (productCheck.rows.length === 0) {
      return sendError(res, null, 'Product not found', 404);
    }

    const product = productCheck.rows[0];

    // Update livestream's pinned products (JSONB array)
    const result = await pool.query(
      `UPDATE livestreams
       SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('pinned_product_id', $1)
       WHERE id = $2
       RETURNING id, metadata`,
      [product_id, id]
    );

    // Emit socket event
    const io = (req.app as any).get('io');
    if (io) {
      io.to(`livestream-${id}`).emit('product-pinned', {
        livestreamId: id,
        productId: product_id,
        product: product,
        timestamp: new Date(),
      });
    }

    return sendSuccess(res, {
      livestreamId: id,
      pinnedProduct: product,
    }, 'Product pinned successfully');
  } catch (error) {
    console.error('Pin product error:', error);
    return sendError(res, error, 'Failed to pin product', 500);
  }
};

// Unpin product
export const unpinProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id, product_id } = req.params;
    const host_id = req.user?.userId;

    if (!host_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    // Verify livestream ownership
    const livestreamCheck = await pool.query(
      'SELECT host_id FROM livestreams WHERE id = $1',
      [id]
    );
    if (livestreamCheck.rows.length === 0) {
      return sendError(res, null, 'Livestream not found', 404);
    }

    if (livestreamCheck.rows[0].host_id !== host_id) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    // Update livestream to remove pinned product
    const result = await pool.query(
      `UPDATE livestreams
       SET metadata = COALESCE(metadata, '{}'::jsonb) - 'pinned_product_id'
       WHERE id = $1
       RETURNING id, metadata`,
      [id]
    );

    // Emit socket event
    const io = (req.app as any).get('io');
    if (io) {
      io.to(`livestream-${id}`).emit('product-unpinned', {
        livestreamId: id,
        productId: product_id,
        timestamp: new Date(),
      });
    }

    return sendSuccess(res, null, 'Product unpinned successfully');
  } catch (error) {
    console.error('Unpin product error:', error);
    return sendError(res, error, 'Failed to unpin product', 500);
  }
};

// Get livestream comments
export const getLivestreamComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    const result = await pool.query(
      `SELECT 
        jsonb_array_elements(metadata->'comments') as comment
       FROM livestreams
       WHERE id = $1`,
      [id]
    );

    // For now, return empty array as comments would be in a separate table or JSONB
    return sendSuccess(res, {
      comments: result.rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Get livestream comments error:', error);
    return sendError(res, error, 'Failed to get comments', 500);
  }
};

// Post livestream comment (via Socket.io - this stores in DB)
export const postLivestreamComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!comment) {
      return sendError(res, null, 'Comment is required', 400);
    }

    // Get user info
    const userResult = await pool.query('SELECT id, name, avatar_url FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return sendError(res, null, 'User not found', 404);
    }

    const user = userResult.rows[0];

    // Store comment in metadata (JSONB)
    const commentObj = {
      userId: user_id,
      userName: user.name,
      userAvatar: user.avatar_url,
      comment: comment,
      timestamp: new Date().toISOString(),
    };

    const result = await pool.query(
      `UPDATE livestreams
       SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('comments', COALESCE(metadata->'comments', '[]'::jsonb) || $1::jsonb)
       WHERE id = $2
       RETURNING id`,
      [JSON.stringify([commentObj]), id]
    );

    // Emit socket event
    const io = (req.app as any).get('io');
    if (io) {
      io.to(`livestream-${id}`).emit('livestream-comment', {
        livestreamId: id,
        userId: user_id,
        userName: user.name,
        userAvatar: user.avatar_url,
        comment: comment,
        timestamp: new Date(),
      });
    }

    return sendSuccess(res, commentObj, 'Comment posted successfully', 201);
  } catch (error) {
    console.error('Post livestream comment error:', error);
    return sendError(res, error, 'Failed to post comment', 500);
  }
};

// Send tip to livestream host
export const sendTip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, message } = req.body;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!amount || amount <= 0) {
      return sendError(res, null, 'Amount must be greater than 0', 400);
    }

    // Get livestream and host info
    const livestreamResult = await pool.query(
      `SELECT l.host_id, u.name as host_name
       FROM livestreams l
       JOIN users u ON l.host_id = u.id
       WHERE l.id = $1`,
      [id]
    );

    if (livestreamResult.rows.length === 0) {
      return sendError(res, null, 'Livestream not found', 404);
    }

    const { host_id, host_name } = livestreamResult.rows[0];

    // Get sender info
    const senderResult = await pool.query(
      'SELECT id, name FROM users WHERE id = $1',
      [user_id]
    );
    const sender = senderResult.rows[0];

    // Store tip in metadata
    const tipObj = {
      senderId: user_id,
      senderName: sender.name,
      hostId: host_id,
      hostName: host_name,
      amount: amount,
      message: message || null,
      timestamp: new Date().toISOString(),
    };

    // Update livestream with tip
    const result = await pool.query(
      `UPDATE livestreams
       SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('tips', COALESCE(metadata->'tips', '[]'::jsonb) || $1::jsonb)
       WHERE id = $2
       RETURNING id`,
      [JSON.stringify([tipObj]), id]
    );

    // Emit socket event
    const io = (req.app as any).get('io');
    if (io) {
      io.to(`livestream-${id}`).emit('tip-sent', {
        livestreamId: id,
        senderId: user_id,
        senderName: sender.name,
        hostId: host_id,
        hostName: host_name,
        amount: amount,
        message: message || null,
        timestamp: new Date(),
      });
    }

    return sendSuccess(res, tipObj, 'Tip sent successfully', 201);
  } catch (error) {
    console.error('Send tip error:', error);
    return sendError(res, error, 'Failed to send tip', 500);
  }
};

// Update viewer count
export const updateViewerCount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { viewer_count } = req.body;

    if (viewer_count === undefined || viewer_count < 0) {
      return sendError(res, null, 'viewer_count must be a non-negative number', 400);
    }

    const result = await pool.query(
      `UPDATE livestreams
       SET viewer_count = $1
       WHERE id = $2
       RETURNING id, viewer_count`,
      [viewer_count, id]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'Livestream not found', 404);
    }

    // Emit socket event
    const io = (req.app as any).get('io');
    if (io) {
      io.to(`livestream-${id}`).emit('viewer-count-updated', {
        livestreamId: id,
        viewerCount: viewer_count,
        timestamp: new Date(),
      });
    }

    return sendSuccess(res, result.rows[0], 'Viewer count updated');
  } catch (error) {
    console.error('Update viewer count error:', error);
    return sendError(res, error, 'Failed to update viewer count', 500);
  }
};
