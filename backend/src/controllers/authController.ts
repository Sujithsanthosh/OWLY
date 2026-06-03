import { Request, Response } from 'express';
import { sendSuccess, sendError, sendValidationError } from '../utils/responses';
import {
  hashPassword,
  comparePasswords,
  generateTokenPair,
  generateOTP,
  generateReferralCode,
  verifyRefreshToken,
} from '../utils/auth';
import { validateSignupData, validateLoginData } from '../utils/validation';
import pool from '../config/db';

export interface AuthRequest extends Request {
  user?: any;
}

// Signup Controller
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, interests, location } = req.body;

    // Validate input
    const validation = validateSignupData({ name, email, password, phone });
    if (!validation.valid) {
      return sendValidationError(res, validation.errors);
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (existingUser.rows.length > 0) {
      return sendError(res, null, 'User already exists with this email or phone', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate referral code
    const referralCode = generateReferralCode();

    // Create user
    const newUserResult = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, interests, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, name, email, phone, role, created_at`,
      [name, email, passwordHash, phone, JSON.stringify(interests || []), 'customer']
    );

    const newUser = newUserResult.rows[0];

    // Create rewards entry
    await pool.query(
      `INSERT INTO rewards (user_id, referral_code, created_at)
       VALUES ($1, $2, NOW())`,
      [newUser.id, referralCode]
    );

    // Generate tokens
    const tokens = generateTokenPair(newUser.id, 'customer');

    return sendSuccess(res, {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
      ...tokens,
    }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Signup error:', error);
    return sendError(res, error, 'Signup failed', 500);
  }
};

// Login Controller
export const login = async (req: Request, res: Response) => {
  try {
    const { email, phone, password } = req.body;

    // Validate input
    const validation = validateLoginData({ email, phone, password });
    if (!validation.valid) {
      return sendValidationError(res, validation.errors);
    }

    // Find user
    const userResult = await pool.query(
      'SELECT id, name, email, phone, password_hash, role FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (userResult.rows.length === 0) {
      return sendError(res, null, 'Invalid credentials', 401);
    }

    const user = userResult.rows[0];

    // Verify password
    const passwordMatch = await comparePasswords(password, user.password_hash);
    if (!passwordMatch) {
      return sendError(res, null, 'Invalid credentials', 401);
    }

    // Generate tokens
    const tokens = generateTokenPair(user.id, user.role);

    return sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      ...tokens,
    }, 'Login successful', 200);
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, error, 'Login failed', 500);
  }
};

// Register (alias for signup)
export const register = async (req: Request, res: Response) => {
  return signup(req, res);
};

// Refresh Token Controller
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, null, 'Refresh token required', 400);
    }

    const decoded = verifyRefreshToken(refreshToken);
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.userId]);

    if (userResult.rows.length === 0) {
      return sendError(res, null, 'User not found', 401);
    }

    const user = userResult.rows[0];
    const tokens = generateTokenPair(decoded.userId, user.role);

    return sendSuccess(res, tokens, 'Token refreshed successfully');
  } catch (error) {
    console.error('Token refresh error:', error);
    return sendError(res, error, 'Token refresh failed', 401);
  }
};

// Get Profile Controller
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const userResult = await pool.query(
      `SELECT id, name, email, phone, role, avatar_url, bio, interests, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return sendError(res, null, 'User not found', 404);
    }

    return sendSuccess(res, userResult.rows[0], 'Profile retrieved successfully');
  } catch (error) {
    console.error('Get profile error:', error);
    return sendError(res, error, 'Failed to get profile', 500);
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  return getProfile(req, res);
};

// Update Profile Controller
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, bio, interests, avatar_url } = req.body;

    if (!userId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const updatedResult = await pool.query(
      `UPDATE users SET name = COALESCE($1, name),
                        bio = COALESCE($2, bio),
                        interests = COALESCE($3, interests),
                        avatar_url = COALESCE($4, avatar_url),
                        updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, phone, role, avatar_url, bio, interests`,
      [name, bio, interests ? JSON.stringify(interests) : null, avatar_url, userId]
    );

    if (updatedResult.rows.length === 0) {
      return sendError(res, null, 'User not found', 404);
    }

    return sendSuccess(res, updatedResult.rows[0], 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, error, 'Failed to update profile', 500);
  }
};

// Change Password Controller
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return sendError(res, null, 'Missing required fields', 400);
    }

    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return sendError(res, null, 'User not found', 404);
    }

    const user = userResult.rows[0];
    const passwordMatch = await comparePasswords(currentPassword, user.password_hash);
    if (!passwordMatch) {
      return sendError(res, null, 'Current password is incorrect', 401);
    }

    const newPasswordHash = await hashPassword(newPassword);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      newPasswordHash,
      userId,
    ]);

    return sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return sendError(res, error, 'Failed to change password', 500);
  }
};

// Phone OTP Request (for phone login)
export const requestPhoneOTP = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return sendError(res, null, 'Phone number required', 400);
    }

    const otp = generateOTP();

    // TODO: Send OTP via Firebase/Twilio
    // For now, we'll just return it (remove in production)
    console.log(`OTP for ${phone}: ${otp}`);

    return sendSuccess(res, {
      message: 'OTP sent successfully',
      // Remove this in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    }, 'OTP sent');
  } catch (error) {
    console.error('Request OTP error:', error);
    return sendError(res, error, 'Failed to send OTP', 500);
  }
};

// Verify Phone OTP Controller
export const verifyPhoneOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return sendError(res, null, 'Phone and OTP required', 400);
    }

    // TODO: Verify OTP from Redis/temporary storage

    // Find or create user
    const userResult = await pool.query('SELECT id, role FROM users WHERE phone = $1', [phone]);

    let user;
    if (userResult.rows.length === 0) {
      // Create new user with phone
      const newUserResult = await pool.query(
        `INSERT INTO users (phone, role, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id, role`,
        [phone, 'customer']
      );
      user = newUserResult.rows[0];
    } else {
      user = userResult.rows[0];
    }

    const tokens = generateTokenPair(user.id, user.role);

    return sendSuccess(res, {
      user: {
        id: user.id,
        phone,
        role: user.role,
      },
      ...tokens,
    }, 'Phone verified successfully');
  } catch (error) {
    console.error('Verify OTP error:', error);
    return sendError(res, error, 'Failed to verify OTP', 500);
  }
};
