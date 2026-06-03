import { Request, Response } from 'express';
import { sendSuccess, sendError, sendValidationError } from '../utils/responses';
import pool from '../config/db';

export interface AuthRequest extends Request {
  user?: any;
}

const MIN_FOLLOWERS_FOR_VERIFICATION = 1000;
const MIN_CONTENT_QUALITY_SCORE = 60;

// Apply for creator verification
export const applyForVerification = async (req: AuthRequest, res: Response) => {
  try {
    const { category, portfolio_urls } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!category || !portfolio_urls || !Array.isArray(portfolio_urls)) {
      return sendValidationError(res, ['category and portfolio_urls are required']);
    }

    // Check if user is a creator or create creator profile
    let creatorResult = await pool.query(
      'SELECT id FROM creators WHERE user_id = $1',
      [userId]
    );

    let creatorId: number;

    if (creatorResult.rows.length === 0) {
      const createResult = await pool.query(
        `INSERT INTO creators (user_id, category, portfolio_urls, verification_status)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [userId, category, portfolio_urls, 'pending']
      );
      creatorId = createResult.rows[0].id;
    } else {
      creatorId = creatorResult.rows[0].id;
      await pool.query(
        `UPDATE creators SET category = $1, portfolio_urls = $2, verification_status = $3, updated_at = NOW()
         WHERE id = $4`,
        [category, portfolio_urls, 'pending', creatorId]
      );
    }

    // Create or update verification application
    await pool.query(
      `INSERT INTO creator_verifications (creator_id, user_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (creator_id) DO UPDATE SET status = $3, updated_at = NOW()`,
      [creatorId, userId, 'pending']
    );

    return sendSuccess(res, {
      message: 'Verification application submitted successfully',
      creator_id: creatorId,
      status: 'pending',
    }, 'Verification application submitted successfully', 201);
  } catch (error) {
    console.error('Apply for verification error:', error);
    return sendError(res, error, 'Failed to submit verification application', 500);
  }
};

// Get creator profile with verification status
export const getCreatorProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.*, u.name, u.email, u.avatar_url, u.bio,
              cv.status as verification_status, cv.content_quality_score,
              cv.verified_at, cv.rejection_reason
       FROM creators c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN creator_verifications cv ON c.id = cv.creator_id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'Creator not found', 404);
    }

    const creator = result.rows[0];

    return sendSuccess(res, {
      id: creator.id,
      user_id: creator.user_id,
      name: creator.name,
      email: creator.email,
      avatar_url: creator.avatar_url,
      bio: creator.bio,
      category: creator.category,
      portfolio_urls: creator.portfolio_urls,
      total_followers: creator.total_followers,
      is_verified: creator.is_verified,
      verification_status: creator.verification_status,
      content_quality_score: creator.content_quality_score,
      verified_at: creator.verified_at,
      rejection_reason: creator.rejection_reason,
      achievements: creator.achievements || [],
      stats: creator.stats || {},
    });
  } catch (error) {
    console.error('Get creator profile error:', error);
    return sendError(res, error, 'Failed to get creator profile', 500);
  }
};

// Admin verify creator
export const verifyCreator = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { approve, content_quality_score, rejection_reason } = req.body;

    if (req.user?.role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    // Get creator and verification details
    const creatorResult = await pool.query(
      'SELECT id, user_id FROM creators WHERE id = $1',
      [id]
    );

    if (creatorResult.rows.length === 0) {
      return sendError(res, null, 'Creator not found', 404);
    }

    const creator = creatorResult.rows[0];

    if (approve) {
      await pool.query(
        `UPDATE creator_verifications 
         SET status = $1, content_quality_score = $2, verified_at = NOW(), updated_at = NOW()
         WHERE creator_id = $3`,
        ['verified', content_quality_score || MIN_CONTENT_QUALITY_SCORE, id]
      );

      await pool.query(
        `UPDATE creators 
         SET is_verified = TRUE, verification_status = $1, content_quality_score = $2, updated_at = NOW()
         WHERE id = $3`,
        ['verified', content_quality_score || MIN_CONTENT_QUALITY_SCORE, id]
      );
    } else {
      await pool.query(
        `UPDATE creator_verifications 
         SET status = $1, rejection_reason = $2, rejected_at = NOW(), updated_at = NOW()
         WHERE creator_id = $3`,
        ['rejected', rejection_reason || '', id]
      );

      await pool.query(
        `UPDATE creators 
         SET is_verified = FALSE, verification_status = $1, updated_at = NOW()
         WHERE id = $2`,
        ['rejected', id]
      );
    }

    return sendSuccess(res, {
      message: approve ? 'Creator verified successfully' : 'Creator verification rejected',
      creator_id: id,
      status: approve ? 'verified' : 'rejected',
    });
  } catch (error) {
    console.error('Verify creator error:', error);
    return sendError(res, error, 'Failed to verify creator', 500);
  }
};

// List creators with filters
export const listCreators = async (req: Request, res: Response) => {
  try {
    const {
      category,
      verification_status,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      order = 'DESC',
    } = req.query;

    const offset = ((Number(page) - 1) * Number(limit));
    let query = `SELECT c.*, u.name, u.email, u.avatar_url, u.bio, cv.status as verification_status
                 FROM creators c
                 LEFT JOIN users u ON c.user_id = u.id
                 LEFT JOIN creator_verifications cv ON c.id = cv.creator_id
                 WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND c.category = $${paramIndex++}`;
      params.push(category);
    }

    if (verification_status) {
      query += ` AND c.verification_status = $${paramIndex++}`;
      params.push(verification_status);
    }

    const validSortFields = ['created_at', 'total_followers', 'is_verified'];
    const sortField = validSortFields.includes(String(sort_by)) ? sort_by : 'created_at';
    const sortOrder = ['ASC', 'DESC'].includes(String(order).toUpperCase()) ? order : 'DESC';

    query += ` ORDER BY c.${sortField} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM creators c WHERE 1=1${
        category ? ` AND c.category = $1` : ''
      }${verification_status ? ` AND c.verification_status = ${category ? '$2' : '$1'}` : ''}`,
      category && verification_status ? [category, verification_status] : (category ? [category] : [])
    );

    return sendSuccess(res, {
      creators: result.rows.map(c => ({
        id: c.id,
        user_id: c.user_id,
        name: c.name,
        avatar_url: c.avatar_url,
        category: c.category,
        portfolio_urls: c.portfolio_urls,
        total_followers: c.total_followers,
        is_verified: c.is_verified,
        verification_status: c.verification_status,
        content_quality_score: c.content_quality_score,
        achievements: c.achievements || [],
        stats: c.stats || {},
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(parseInt(countResult.rows[0].total) / Number(limit)),
      },
    });
  } catch (error) {
    console.error('List creators error:', error);
    return sendError(res, error, 'Failed to list creators', 500);
  }
};

// Update creator profile
export const updateCreatorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { category, portfolio_urls, total_followers, achievements, stats } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const creatorResult = await pool.query(
      'SELECT user_id FROM creators WHERE id = $1',
      [id]
    );

    if (creatorResult.rows.length === 0) {
      return sendError(res, null, 'Creator not found', 404);
    }

    if (creatorResult.rows[0].user_id !== userId && req.user?.role !== 'admin') {
      return sendError(res, null, 'Unauthorized', 403);
    }

    await pool.query(
      `UPDATE creators 
       SET category = COALESCE($1, category),
           portfolio_urls = COALESCE($2, portfolio_urls),
           total_followers = COALESCE($3, total_followers),
           achievements = COALESCE($4, achievements),
           stats = COALESCE($5, stats),
           updated_at = NOW()
       WHERE id = $6`,
      [category, portfolio_urls, total_followers, JSON.stringify(achievements), JSON.stringify(stats), id]
    );

    return sendSuccess(res, {
      message: 'Creator profile updated successfully',
      creator_id: id,
    });
  } catch (error) {
    console.error('Update creator profile error:', error);
    return sendError(res, error, 'Failed to update creator profile', 500);
  }
};
