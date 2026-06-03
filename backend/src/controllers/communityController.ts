import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responses';
import pool from '../config/db';

export interface AuthRequest extends Request {
  user?: any;
}

// Create community
export const createCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, type, banner_url, is_private } = req.body;
    const creator_id = req.user?.userId;

    if (!creator_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!name || !type) {
      return sendError(res, null, 'Name and type are required', 400);
    }

    const result = await pool.query(
      `INSERT INTO communities (name, description, type, creator_id, banner_url, is_private, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, name, description, type, creator_id, banner_url, is_private, created_at`,
      [name, description, type, creator_id, banner_url, is_private || false]
    );

    const community = result.rows[0];

    // Add creator as admin member
    await pool.query(
      `INSERT INTO community_members (community_id, user_id, role, joined_at)
       VALUES ($1, $2, $3, NOW())`,
      [community.id, creator_id, 'admin']
    );

    return sendSuccess(res, community, 'Community created successfully', 201);
  } catch (error) {
    console.error('Create community error:', error);
    return sendError(res, error, 'Failed to create community', 500);
  }
};

// Get all communities
export const getCommunities = async (req: Request, res: Response) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    let query = 'SELECT c.*, COUNT(cm.user_id) as member_count FROM communities c LEFT JOIN community_members cm ON c.id = cm.community_id WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND c.type = $${paramIndex++}`;
      params.push(type);
    }

    if (search) {
      query += ` AND (c.name ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return sendSuccess(res, {
      communities: result.rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Get communities error:', error);
    return sendError(res, error, 'Failed to get communities', 500);
  }
};

// Get single community
export const getCommunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM communities WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'Community not found', 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    console.error('Get community error:', error);
    return sendError(res, error, 'Failed to get community', 500);
  }
};

// Update community
export const updateCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, banner_url } = req.body;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    // Verify admin permission
    const permission = await pool.query(
      'SELECT role FROM community_members WHERE community_id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (permission.rows.length === 0 || permission.rows[0].role !== 'admin') {
      return sendError(res, null, 'Unauthorized', 403);
    }

    const result = await pool.query(
      `UPDATE communities 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           banner_url = COALESCE($3, banner_url)
       WHERE id = $4
       RETURNING id, name, description, banner_url`,
      [name, description, banner_url, id]
    );

    return sendSuccess(res, result.rows[0], 'Community updated successfully');
  } catch (error) {
    console.error('Update community error:', error);
    return sendError(res, error, 'Failed to update community', 500);
  }
};

// Join community
export const joinCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    await pool.query(
      `INSERT INTO community_members (community_id, user_id, role, joined_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (community_id, user_id) DO NOTHING`,
      [id, user_id, 'member']
    );

    return sendSuccess(res, { message: 'Joined community' }, 'Joined community successfully');
  } catch (error) {
    console.error('Join community error:', error);
    return sendError(res, error, 'Failed to join community', 500);
  }
};

// Leave community
export const leaveCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    await pool.query(
      'DELETE FROM community_members WHERE community_id = $1 AND user_id = $2',
      [id, user_id]
    );

    return sendSuccess(res, null, 'Left community successfully');
  } catch (error) {
    console.error('Leave community error:', error);
    return sendError(res, error, 'Failed to leave community', 500);
  }
};

// Get community members
export const getCommunityMembers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    const result = await pool.query(
      `SELECT u.id, u.name, u.avatar_url, cm.role, cm.joined_at
       FROM community_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.community_id = $1
       ORDER BY cm.joined_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    return sendSuccess(res, {
      members: result.rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Get community members error:', error);
    return sendError(res, error, 'Failed to get community members', 500);
  }
};

// Get user communities
export const getUserCommunities = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const result = await pool.query(
      `SELECT c.* FROM communities c
       JOIN community_members cm ON c.id = cm.community_id
       WHERE cm.user_id = $1
       ORDER BY cm.joined_at DESC`,
      [user_id]
    );

    return sendSuccess(res, {
      communities: result.rows,
    });
  } catch (error) {
    console.error('Get user communities error:', error);
    return sendError(res, error, 'Failed to get user communities', 500);
  }
};
