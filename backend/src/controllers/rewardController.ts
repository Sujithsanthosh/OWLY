import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responses';
import pool from '../config/db';

export interface AuthRequest extends Request {
  user?: any;
}

// Get my rewards
export const getMyRewards = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const result = await pool.query('SELECT * FROM rewards WHERE user_id = $1', [user_id]);

    if (result.rows.length === 0) {
      return sendError(res, null, 'Rewards not found', 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    console.error('Get my rewards error:', error);
    return sendError(res, error, 'Failed to get rewards', 500);
  }
};

// Get referral code
export const getReferralCode = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const result = await pool.query(
      'SELECT referral_code FROM rewards WHERE user_id = $1',
      [user_id]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'Referral code not found', 404);
    }

    return sendSuccess(res, {
      referral_code: result.rows[0].referral_code,
      referral_url: `${process.env.APP_URL || 'https://owly.app'}/refer/${result.rows[0].referral_code}`,
    });
  } catch (error) {
    console.error('Get referral code error:', error);
    return sendError(res, error, 'Failed to get referral code', 500);
  }
};

// Add points
export const addPoints = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.userId;
    const { points, reason } = req.body;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!points || points <= 0) {
      return sendError(res, null, 'Points must be greater than 0', 400);
    }

    const result = await pool.query(
      'UPDATE rewards SET points = points + $1 WHERE user_id = $2 RETURNING points',
      [points, user_id]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'User rewards not found', 404);
    }

    return sendSuccess(res, {
      points: result.rows[0].points,
      added: points,
      reason: reason || 'Manual addition',
    }, `Added ${points} points`);
  } catch (error) {
    console.error('Add points error:', error);
    return sendError(res, error, 'Failed to add points', 500);
  }
};

// Redeempoints
export const redeemPoints = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.userId;
    const { points, type = 'cashback' } = req.body;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!points || points <= 0) {
      return sendError(res, null, 'Points must be greater than 0', 400);
    }

    const rewardResult = await pool.query(
      'SELECT points FROM rewards WHERE user_id = $1',
      [user_id]
    );

    if (rewardResult.rows.length === 0) {
      return sendError(res, null, 'User rewards not found', 404);
    }

    if (rewardResult.rows[0].points < points) {
      return sendError(res, null, 'Insufficient points for redemption', 400);
    }

    const result = await pool.query(
      'UPDATE rewards SET points = points - $1 WHERE user_id = $2 RETURNING points',
      [points, user_id]
    );

    return sendSuccess(res, {
      points: result.rows[0].points,
      redeemed: points,
      type,
      amount_credited: (points / 100).toFixed(2), // 1 point = 1 paise
    }, 'Points redeemed successfully');
  } catch (error) {
    console.error('Redeem points error:', error);
    return sendError(res, error, 'Failed to redeem points', 500);
  }
};

// Handle referral
export const handleReferral = async (req: AuthRequest, res: Response) => {
  try {
    const { referral_code } = req.body;
    const user_id = req.user?.userId;

    if (!user_id) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!referral_code) {
      return sendError(res, null, 'Referral code is required', 400);
    }

    // Find referrer
    const referrerResult = await pool.query(
      'SELECT user_id FROM rewards WHERE referral_code = $1',
      [referral_code]
    );

    if (referrerResult.rows.length === 0) {
      return sendError(res, null, 'Invalid referral code', 404);
    }

    const referrer_id = referrerResult.rows[0].user_id;

    // Check if already referred
    const existingReferral = await pool.query(
      'SELECT referred_by FROM rewards WHERE user_id = $1',
      [user_id]
    );

    if (existingReferral.rows[0].referred_by) {
      return sendError(res, null, 'You have already used a referral code', 400);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Add points to referrer (100 points)
      await client.query(
        'UPDATE rewards SET points = points + 100 WHERE user_id = $1',
        [referrer_id]
      );

      // Add points to referred user (50 points)
      await client.query(
        'UPDATE rewards SET points = points + 50, referred_by = $1 WHERE user_id = $2',
        [referrer_id, user_id]
      );

      await client.query('COMMIT');

      return sendSuccess(res, {
        message: 'Referral applied successfully!',
        points_referrer: 100,
        points_you: 50,
      }, 'Referral applied successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Handle referral error:', error);
    return sendError(res, error, 'Failed to apply referral', 500);
  }
};

// Get leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { type = 'points', limit = 10 } = req.query;

    let orderBy = 'points DESC';
    if (type === 'referrals') {
      // Count referrals from rewards table
      orderBy = '(SELECT COUNT(*) FROM rewards r2 WHERE r2.referred_by = r.user_id) DESC';
    }

    const result = await pool.query(
      `SELECT r.user_id, u.name, u.avatar_url, r.points,
              (SELECT COUNT(*) FROM rewards r2 WHERE r2.referred_by = r.user_id) as referral_count
       FROM rewards r
       JOIN users u ON r.user_id = u.id
       ORDER BY ${orderBy}
       LIMIT $1`,
      [limit]
    );

    return sendSuccess(res, {
      leaderboard: result.rows,
      type,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return sendError(res, error, 'Failed to get leaderboard', 500);
  }
};
