import { Request, Response } from 'express';
import { sendSuccess, sendError, sendValidationError } from '../utils/responses';
import pool from '../config/db';

export interface AuthRequest extends Request {
  user?: any;
}

// Badge types and definitions
const BADGE_DEFINITIONS = {
  // Milestone badges
  'first_purchase': {
    type: 'milestone',
    name: 'First Purchase',
    description: 'Made your first purchase',
    rarity: 'common',
  },
  'ten_purchases': {
    type: 'milestone',
    name: '10 Purchases',
    description: 'Completed 10 purchases',
    rarity: 'rare',
  },
  'hundred_purchases': {
    type: 'milestone',
    name: '100 Purchases',
    description: 'Completed 100 purchases',
    rarity: 'epic',
  },
  // Social badges
  'first_like': {
    type: 'social',
    name: 'First Like',
    description: 'Liked your first post',
    rarity: 'common',
  },
  'hundred_followers': {
    type: 'social',
    name: '100 Followers',
    description: 'Reached 100 followers',
    rarity: 'rare',
  },
  'thousand_followers': {
    type: 'social',
    name: '1K Followers',
    description: 'Reached 1000 followers',
    rarity: 'epic',
  },
  // Seller badges
  'first_sale': {
    type: 'seller',
    name: 'First Sale',
    description: 'Made your first sale',
    rarity: 'common',
  },
  'ten_sales': {
    type: 'seller',
    name: '10 Sales',
    description: 'Made 10 sales',
    rarity: 'rare',
  },
  // Content creator badges
  'first_post': {
    type: 'content_creator',
    name: 'First Post',
    description: 'Published your first post',
    rarity: 'common',
  },
  'prolific_creator': {
    type: 'content_creator',
    name: 'Prolific Creator',
    description: 'Published 50 posts',
    rarity: 'rare',
  },
};

// Award badge to user (internal/admin)
export const awardBadge = async (req: AuthRequest, res: Response) => {
  try {
    const { user_id, badge_id } = req.body;

    if (req.user?.role !== 'admin' && req.user?.userId !== user_id) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    if (!user_id || !badge_id) {
      return sendValidationError(res, ['user_id and badge_id are required']);
    }

    const badgeConfig = BADGE_DEFINITIONS[badge_id as keyof typeof BADGE_DEFINITIONS];
    if (!badgeConfig) {
      return sendError(res, null, 'Invalid badge ID', 400);
    }

    // Check if user already has this badge
    const existingBadge = await pool.query(
      `SELECT id FROM badges WHERE user_id = $1 AND badge_name = $2`,
      [user_id, badgeConfig.name]
    );

    if (existingBadge.rows.length > 0) {
      return sendError(res, null, 'User already has this badge', 400);
    }

    // Award badge
    const result = await pool.query(
      `INSERT INTO badges (user_id, badge_type, badge_name, description, rarity, awarded_at, metadata)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6)
       RETURNING id, badge_type, badge_name, description, rarity, awarded_at`,
      [
        user_id,
        badgeConfig.type,
        badgeConfig.name,
        badgeConfig.description,
        badgeConfig.rarity,
        JSON.stringify({ badge_id }),
      ]
    );

    return sendSuccess(res, {
      message: 'Badge awarded successfully',
      badge: result.rows[0],
    }, 'Badge awarded successfully', 201);
  } catch (error) {
    console.error('Award badge error:', error);
    return sendError(res, error, 'Failed to award badge', 500);
  }
};

// Get user's badges
export const getUserBadges = async (req: AuthRequest, res: Response) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT id, badge_type, badge_name, description, icon_url, rarity, awarded_at, metadata
       FROM badges
       WHERE user_id = $1
       ORDER BY awarded_at DESC`,
      [user_id]
    );

    return sendSuccess(res, {
      user_id: Number(user_id),
      total_badges: result.rows.length,
      badges: result.rows,
    });
  } catch (error) {
    console.error('Get user badges error:', error);
    return sendError(res, error, 'Failed to get user badges', 500);
  }
};

// Check/update streak
export const checkStreak = async (req: AuthRequest, res: Response) => {
  try {
    const { streak_type } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!streak_type) {
      return sendValidationError(res, ['streak_type is required']);
    }

    const validStreaks = ['daily_login', 'daily_purchase', 'daily_referral'];
    if (!validStreaks.includes(streak_type)) {
      return sendError(res, null, 'Invalid streak type', 400);
    }

    const today = new Date().toISOString().split('T')[0];

    const streakResult = await pool.query(
      `SELECT id, current_count, longest_count, last_action_date
       FROM streaks
       WHERE user_id = $1 AND streak_type = $2`,
      [userId, streak_type]
    );

    let streak;

    if (streakResult.rows.length === 0) {
      const createResult = await pool.query(
        `INSERT INTO streaks (user_id, streak_type, current_count, longest_count, last_action_date, created_at, updated_at)
         VALUES ($1, $2, 1, 1, $3, NOW(), NOW())
         RETURNING id, current_count, longest_count, last_action_date`,
        [userId, streak_type, today]
      );
      streak = createResult.rows[0];
    } else {
      const existingStreak = streakResult.rows[0];
      const lastDate = existingStreak.last_action_date;
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];

      let newCount = existingStreak.current_count;

      if (lastDate === today) {
        // Already updated today
      } else if (lastDate === yesterday) {
        // Streak continues
        newCount = existingStreak.current_count + 1;
      } else {
        // Streak broken, reset to 1
        newCount = 1;
      }

      const newLongest = Math.max(newCount, existingStreak.longest_count);

      const updateResult = await pool.query(
        `UPDATE streaks
         SET current_count = $1, longest_count = $2, last_action_date = $3, updated_at = NOW()
         WHERE user_id = $4 AND streak_type = $5
         RETURNING id, current_count, longest_count, last_action_date`,
        [newCount, newLongest, today, userId, streak_type]
      );
      streak = updateResult.rows[0];
    }

    return sendSuccess(res, {
      user_id: userId,
      streak_type,
      ...streak,
    });
  } catch (error) {
    console.error('Check streak error:', error);
    return sendError(res, error, 'Failed to check streak', 500);
  }
};

// Get user level
export const getUserLevel = async (req: AuthRequest, res: Response) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT id, level, experience_points, total_points, created_at, updated_at
       FROM user_levels
       WHERE user_id = $1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      // Create default level entry
      const createResult = await pool.query(
        `INSERT INTO user_levels (user_id, level, experience_points, total_points, created_at, updated_at)
         VALUES ($1, 1, 0, 0, NOW(), NOW())
         RETURNING id, level, experience_points, total_points, created_at, updated_at`,
        [user_id]
      );
      return sendSuccess(res, {
        user_id: Number(user_id),
        ...createResult.rows[0],
      });
    }

    return sendSuccess(res, {
      user_id: Number(user_id),
      ...result.rows[0],
    });
  } catch (error) {
    console.error('Get user level error:', error);
    return sendError(res, error, 'Failed to get user level', 500);
  }
};

// Update user level (internal)
export const updateUserLevel = async (req: AuthRequest, res: Response) => {
  try {
    const { user_id, experience_points } = req.body;

    if (req.user?.role !== 'admin' && req.user?.userId !== user_id) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    if (!user_id || experience_points === undefined) {
      return sendValidationError(res, ['user_id and experience_points are required']);
    }

    // Get current level
    let levelResult = await pool.query(
      `SELECT id, level, experience_points, total_points FROM user_levels WHERE user_id = $1`,
      [user_id]
    );

    if (levelResult.rows.length === 0) {
      levelResult = await pool.query(
        `INSERT INTO user_levels (user_id, level, experience_points, total_points, created_at, updated_at)
         VALUES ($1, 1, 0, 0, NOW(), NOW())
         RETURNING id, level, experience_points, total_points`,
        [user_id]
      );
    }

    const currentLevel = levelResult.rows[0];
    const newExperience = currentLevel.experience_points + experience_points;
    const newTotalPoints = currentLevel.total_points + experience_points;

    // Calculate level (every 1000 XP = 1 level)
    const newLevel = Math.floor(newTotalPoints / 1000) + 1;

    const result = await pool.query(
      `UPDATE user_levels
       SET level = $1, experience_points = $2, total_points = $3, updated_at = NOW()
       WHERE user_id = $4
       RETURNING id, level, experience_points, total_points, updated_at`,
      [newLevel, newExperience % 1000, newTotalPoints, user_id]
    );

    return sendSuccess(res, {
      user_id,
      ...result.rows[0],
      level_up: newLevel > currentLevel.level,
      previous_level: currentLevel.level,
      new_level: newLevel,
    });
  } catch (error) {
    console.error('Update user level error:', error);
    return sendError(res, error, 'Failed to update user level', 500);
  }
};

// Get leaderboards
export const getLeaderboards = async (req: Request, res: Response) => {
  try {
    const { type = 'points', limit = 10 } = req.query;

    const validTypes = ['points', 'followers', 'purchases', 'referrals', 'streaks'];
    if (!validTypes.includes(String(type))) {
      return sendError(res, null, 'Invalid leaderboard type', 400);
    }

    let query = '';
    const params = [Number(limit)];

    switch (type) {
      case 'points':
        query = `SELECT ul.user_id, ul.level, ul.total_points as value, 
                        ROW_NUMBER() OVER (ORDER BY ul.total_points DESC) as rank,
                        u.name, u.avatar_url
                 FROM user_levels ul
                 JOIN users u ON ul.user_id = u.id
                 ORDER BY ul.total_points DESC
                 LIMIT $1`;
        break;

      case 'followers':
        query = `SELECT c.user_id, c.total_followers as value,
                        ROW_NUMBER() OVER (ORDER BY c.total_followers DESC) as rank,
                        u.name, u.avatar_url
                 FROM creators c
                 JOIN users u ON c.user_id = u.id
                 ORDER BY c.total_followers DESC
                 LIMIT $1`;
        break;

      case 'purchases':
        query = `SELECT o.user_id, COUNT(o.id) as value,
                        ROW_NUMBER() OVER (ORDER BY COUNT(o.id) DESC) as rank,
                        u.name, u.avatar_url
                 FROM orders o
                 JOIN users u ON o.user_id = u.id
                 WHERE o.status = 'delivered'
                 GROUP BY o.user_id, u.name, u.avatar_url
                 ORDER BY COUNT(o.id) DESC
                 LIMIT $1`;
        break;

      case 'referrals':
        query = `SELECT r.user_id, COUNT(r.id) as value,
                        ROW_NUMBER() OVER (ORDER BY COUNT(r.id) DESC) as rank,
                        u.name, u.avatar_url
                 FROM rewards r
                 JOIN users u ON r.user_id = u.id
                 WHERE r.referred_by IS NOT NULL
                 GROUP BY r.user_id, u.name, u.avatar_url
                 ORDER BY COUNT(r.id) DESC
                 LIMIT $1`;
        break;

      case 'streaks':
        query = `SELECT user_id, MAX(current_count) as value,
                        ROW_NUMBER() OVER (ORDER BY MAX(current_count) DESC) as rank,
                        u.name, u.avatar_url
                 FROM streaks s
                 JOIN users u ON s.user_id = u.id
                 GROUP BY user_id, u.name, u.avatar_url
                 ORDER BY MAX(current_count) DESC
                 LIMIT $1`;
        break;
    }

    const result = await pool.query(query, params);

    return sendSuccess(res, {
      type,
      leaderboard: result.rows.map(row => ({
        rank: row.rank,
        user_id: row.user_id,
        name: row.name,
        avatar_url: row.avatar_url,
        value: row.value,
        level: row.level || undefined,
      })),
    });
  } catch (error) {
    console.error('Get leaderboards error:', error);
    return sendError(res, error, 'Failed to get leaderboards', 500);
  }
};

// Get all available badges
export const getAvailableBadges = async (req: Request, res: Response) => {
  try {
    const badges = Object.entries(BADGE_DEFINITIONS).map(([id, config]) => ({
      id,
      ...config,
    }));

    return sendSuccess(res, {
      total_badges: badges.length,
      badges,
    });
  } catch (error) {
    console.error('Get available badges error:', error);
    return sendError(res, error, 'Failed to get available badges', 500);
  }
};
