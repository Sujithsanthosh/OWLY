import { Request, Response } from 'express';
import pool from '../config/db';

// Get wallet balance
export const getWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT 
        id,
        user_id,
        balance,
        currency,
        total_earned,
        total_spent,
        total_refunded,
        last_transaction_at,
        updated_at
       FROM wallets 
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Create wallet if it doesn't exist
      const createResult = await pool.query(
        `INSERT INTO wallets (user_id, balance, currency, total_earned, total_spent, total_refunded)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, 0, 'USD', 0, 0, 0]
      );

      return res.status(200).json({
        success: true,
        data: createResult.rows[0],
        message: 'Wallet created',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet',
      error: error.message,
    });
  }
};

// Add money to wallet
export const addMoneyToWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { amount, orderId, paymentMethod } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get or create wallet
      let walletRes = await client.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
      let wallet = walletRes.rows[0];

      if (!wallet) {
        walletRes = await client.query(
          `INSERT INTO wallets (user_id, balance, currency, total_earned, total_spent, total_refunded)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [userId, amount, 'USD', amount, 0, 0]
        );
        wallet = walletRes.rows[0];
      } else {
        // Update wallet balance
        const updateRes = await client.query(
          `UPDATE wallets 
           SET balance = balance + $1,
               total_earned = total_earned + $1,
               last_transaction_at = NOW(),
               updated_at = NOW()
           WHERE user_id = $2
           RETURNING *`,
          [amount, userId]
        );
        wallet = updateRes.rows[0];
      }

      // Create transaction record
      await client.query(
        `INSERT INTO wallet_transactions (wallet_id, type, amount, description, order_id, payment_method, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [wallet.id, 'credit', amount, 'Money added to wallet', orderId || null, paymentMethod || 'direct', 'completed']
      );

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        data: wallet,
        message: 'Money added to wallet successfully',
      });
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error adding money to wallet',
      error: error.message,
    });
  }
};

// Use wallet balance for order
export const useWalletBalance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { amount, orderId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get wallet
      const walletRes = await client.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);

      if (walletRes.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found',
        });
      }

      const wallet = walletRes.rows[0];

      if (wallet.balance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance',
        });
      }

      // Deduct from wallet
      const updateRes = await client.query(
        `UPDATE wallets 
         SET balance = balance - $1,
             total_spent = total_spent + $1,
             last_transaction_at = NOW(),
             updated_at = NOW()
         WHERE user_id = $2
         RETURNING *`,
        [amount, userId]
      );

      const updatedWallet = updateRes.rows[0];

      // Create transaction record
      await client.query(
        `INSERT INTO wallet_transactions (wallet_id, type, amount, description, order_id, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [wallet.id, 'debit', amount, 'Payment from wallet', orderId || null, 'completed']
      );

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        data: updatedWallet,
        message: 'Wallet balance used for payment',
      });
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error using wallet balance',
      error: error.message,
    });
  }
};

// Get wallet transactions
export const getWalletTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await pool.query(
      `SELECT wt.* FROM wallet_transactions wt
       JOIN wallets w ON wt.wallet_id = w.id
       WHERE w.user_id = $1
       ORDER BY wt.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM wallet_transactions wt
       JOIN wallets w ON wt.wallet_id = w.id
       WHERE w.user_id = $1`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(countResult.rows[0].count),
        pages: Math.ceil(Number(countResult.rows[0].count) / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet transactions',
      error: error.message,
    });
  }
};

// Refund to wallet
export const refundToWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { amount, orderId, reason } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get or create wallet
      let walletRes = await client.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
      let wallet = walletRes.rows[0];

      if (!wallet) {
        walletRes = await client.query(
          `INSERT INTO wallets (user_id, balance, currency, total_earned, total_spent, total_refunded)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [userId, amount, 'USD', 0, 0, amount]
        );
        wallet = walletRes.rows[0];
      } else {
        // Update wallet with refund
        const updateRes = await client.query(
          `UPDATE wallets 
           SET balance = balance + $1,
               total_refunded = total_refunded + $1,
               last_transaction_at = NOW(),
               updated_at = NOW()
           WHERE user_id = $2
           RETURNING *`,
          [amount, userId]
        );
        wallet = updateRes.rows[0];
      }

      // Create refund transaction
      await client.query(
        `INSERT INTO wallet_transactions (wallet_id, type, amount, description, order_id, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [wallet.id, 'refund', amount, reason || 'Order refunded to wallet', orderId || null, 'completed']
      );

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        data: wallet,
        message: 'Amount refunded to wallet',
      });
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error refunding to wallet',
      error: error.message,
    });
  }
};

// Withdraw from wallet
export const withdrawFromWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { amount, bankAccount, bankCode } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get wallet
      const walletRes = await client.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [userId]);

      if (walletRes.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found',
        });
      }

      const wallet = walletRes.rows[0];

      if (wallet.balance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance',
        });
      }

      // Create withdrawal transaction (pending)
      const txRes = await client.query(
        `INSERT INTO wallet_transactions (wallet_id, type, amount, description, status, bank_account)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [wallet.id, 'withdrawal', amount, 'Withdrawal request', 'pending', bankAccount]
      );

      // Create payout record
      await client.query(
        `INSERT INTO payouts (user_id, amount, bank_account, bank_code, status, wallet_transaction_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, amount, bankAccount, bankCode || null, 'pending', txRes.rows[0].id]
      );

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        data: txRes.rows[0],
        message: 'Withdrawal request created. It will be processed within 2-3 business days.',
      });
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating withdrawal request',
      error: error.message,
    });
  }
};
