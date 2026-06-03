import { Request, Response } from 'express';
import pool from '../config/db';
import { sendSuccess, sendError } from '../utils/responses';

export interface AuthRequest extends Request {
  user?: any;
}

// Get dashboard statistics
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM communities) as total_communities,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'completed') as completed_orders,
        (SELECT COUNT(*) FROM livestreams) as total_livestreams,
        (SELECT COUNT(*) FROM livestreams WHERE status = 'live') as live_livestreams,
        (SELECT SUM(total_amount) FROM orders WHERE status = 'completed') as total_gmv,
        (SELECT COUNT(*) FROM users WHERE role = 'seller') as total_sellers
    `);

    const stats = statsResult.rows[0];

    return sendSuccess(res, stats);
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    return sendError(res, error, 'Failed to get statistics', 500);
  }
};

// Get all users
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    const { status = 'all', role: filterRole, page = 1, limit = 20, search } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    let query = 'SELECT id, name, email, phone, role, status, created_at FROM users WHERE 1=1';
    const params: any[] = [];

    if (status !== 'all') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (filterRole) {
      params.push(filterRole);
      query += ` AND role = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return sendSuccess(res, {
      users: result.rows,
      page: Number(page),
      limit: Number(limit),
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return sendError(res, error, 'Failed to get users', 500);
  }
};

// Suspend user
export const suspendUser = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    const { userId } = req.params;
    const { reason } = req.body;

    if (!userId || !reason) {
      return sendError(res, null, 'userId and reason are required', 400);
    }

    const result = await pool.query(
      'UPDATE users SET status = $1, metadata = COALESCE(metadata, \'{}\'::jsonb) || $2::jsonb WHERE id = $3 RETURNING id, status',
      ['suspended', JSON.stringify({ suspension_reason: reason, suspended_at: new Date().toISOString() }), userId]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'User not found', 404);
    }

    return sendSuccess(res, result.rows[0], 'User suspended');
  } catch (error: any) {
    console.error('Suspend user error:', error);
    return sendError(res, error, 'Failed to suspend user', 500);
  }
};

// Activate user
export const activateUser = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    const { userId } = req.params;

    if (!userId) {
      return sendError(res, null, 'userId is required', 400);
    }

    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, status',
      ['active', userId]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'User not found', 404);
    }

    return sendSuccess(res, result.rows[0], 'User activated');
  } catch (error: any) {
    console.error('Activate user error:', error);
    return sendError(res, error, 'Failed to activate user', 500);
  }
};

// Get all sellers
export const getSellers = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    const { status = 'all', page = 1, limit = 20 } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    let query = `SELECT u.id, u.name, u.email, u.phone, u.created_at, 
                 COUNT(p.id) as product_count,
                 SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END) as total_sales
                 FROM users u
                 LEFT JOIN products p ON u.id = p.seller_id
                 LEFT JOIN orders o ON p.seller_id = o.seller_id
                 WHERE u.role = 'seller'`;
    
    const params: any[] = [];

    if (status !== 'all') {
      params.push(status);
      query += ` AND u.status = $${params.length}`;
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return sendSuccess(res, {
      sellers: result.rows,
      page: Number(page),
      limit: Number(limit),
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error('Get sellers error:', error);
    return sendError(res, error, 'Failed to get sellers', 500);
  }
};

// Approve seller
export const approveSeller = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    const { sellerId } = req.params;

    if (!sellerId) {
      return sendError(res, null, 'sellerId is required', 400);
    }

    const result = await pool.query(
      'UPDATE users SET role = $1, status = $2 WHERE id = $3 RETURNING id, role, status',
      ['seller', 'active', sellerId]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'Seller not found', 404);
    }

    return sendSuccess(res, result.rows[0], 'Seller approved');
  } catch (error: any) {
    console.error('Approve seller error:', error);
    return sendError(res, error, 'Failed to approve seller', 500);
  }
};

// Ban seller
export const banSeller = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    const { sellerId } = req.params;
    const { reason } = req.body;

    if (!sellerId || !reason) {
      return sendError(res, null, 'sellerId and reason are required', 400);
    }

    const result = await pool.query(
      'UPDATE users SET status = $1, metadata = COALESCE(metadata, \'{}\'::jsonb) || $2::jsonb WHERE id = $3 RETURNING id, status',
      ['banned', JSON.stringify({ ban_reason: reason, banned_at: new Date().toISOString() }), sellerId]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'Seller not found', 404);
    }

    return sendSuccess(res, result.rows[0], 'Seller banned');
  } catch (error: any) {
    console.error('Ban seller error:', error);
    return sendError(res, error, 'Failed to ban seller', 500);
  }
};

// Get orders
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    const { status = 'all', page = 1, limit = 20 } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    let query = `SELECT o.id, o.customer_id, o.seller_id, o.total_amount, o.status, o.created_at,
                 u.name as customer_name, s.name as seller_name
                 FROM orders o
                 JOIN users u ON o.customer_id = u.id
                 JOIN users s ON o.seller_id = s.id
                 WHERE 1=1`;
    
    const params: any[] = [];

    if (status !== 'all') {
      params.push(status);
      query += ` AND o.status = $${params.length}`;
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return sendSuccess(res, {
      orders: result.rows,
      page: Number(page),
      limit: Number(limit),
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    return sendError(res, error, 'Failed to get orders', 500);
  }
};

// Resolve dispute
export const resolveDispute = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    const { orderId } = req.params;
    const { resolution, amount } = req.body;

    if (!orderId || !resolution) {
      return sendError(res, null, 'orderId and resolution are required', 400);
    }

    const result = await pool.query(
      `UPDATE orders 
       SET status = 'resolved', metadata = COALESCE(metadata, '{}'::jsonb) || $1::jsonb
       WHERE id = $2 
       RETURNING id, status`,
      [JSON.stringify({ resolution, resolved_amount: amount, resolved_at: new Date().toISOString() }), orderId]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'Order not found', 404);
    }

    return sendSuccess(res, result.rows[0], 'Dispute resolved');
  } catch (error: any) {
    console.error('Resolve dispute error:', error);
    return sendError(res, error, 'Failed to resolve dispute', 500);
  }
};

// Get abuse reports
export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    let query = `SELECT id, type, reported_user_id, reporter_id, reason, status, created_at
                 FROM reports
                 WHERE 1=1`;
    
    const params: any[] = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return sendSuccess(res, {
      reports: result.rows,
      page: Number(page),
      limit: Number(limit),
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error('Get reports error:', error);
    return sendError(res, error, 'Failed to get reports', 500);
  }
};

// Action on report
export const actionOnReport = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    const { reportId } = req.params;
    const { action, notes } = req.body;

    if (!reportId || !action) {
      return sendError(res, null, 'reportId and action are required', 400);
    }

    const validActions = ['approved', 'rejected', 'investigating'];
    if (!validActions.includes(action)) {
      return sendError(res, null, `Invalid action. Must be one of: ${validActions.join(', ')}`, 400);
    }

    const result = await pool.query(
      `UPDATE reports
       SET status = $1, metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb
       WHERE id = $3
       RETURNING id, status`,
      [action, JSON.stringify({ action_notes: notes, actioned_at: new Date().toISOString() }), reportId]
    );

    if (result.rows.length === 0) {
      return sendError(res, null, 'Report not found', 404);
    }

    return sendSuccess(res, result.rows[0], 'Action taken on report');
  } catch (error: any) {
    console.error('Action on report error:', error);
    return sendError(res, error, 'Failed to take action', 500);
  }
};

// Get analytics
export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    const { period = 'month' } = req.query;

    let dateFilter = "WHERE created_at >= NOW() - INTERVAL '30 days'";
    if (period === 'week') {
      dateFilter = "WHERE created_at >= NOW() - INTERVAL '7 days'";
    } else if (period === 'year') {
      dateFilter = "WHERE created_at >= NOW() - INTERVAL '1 year'";
    }

    const analyticsResult = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT customer_id) as new_users,
        COUNT(*) as new_orders,
        SUM(total_amount) as daily_revenue
      FROM orders
      ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    return sendSuccess(res, {
      analytics: analyticsResult.rows,
      period,
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return sendError(res, error, 'Failed to get analytics', 500);
  }
};

// Get payments
export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    const { status = 'all', page = 1, limit = 20 } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    let query = `SELECT id, order_id, amount, status, gateway, created_at
                 FROM payments
                 WHERE 1=1`;
    
    const params: any[] = [];

    if (status !== 'all') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return sendSuccess(res, {
      payments: result.rows,
      page: Number(page),
      limit: Number(limit),
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error('Get payments error:', error);
    return sendError(res, error, 'Failed to get payments', 500);
  }
};

// Process payout
export const processPayout = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    const { sellerId, amount } = req.body;

    if (!sellerId || !amount) {
      return sendError(res, null, 'sellerId and amount are required', 400);
    }

    // In a real app, this would process via payment gateway
    const result = await pool.query(
      `INSERT INTO payouts (seller_id, amount, status, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, seller_id, amount, status`,
      [sellerId, amount, 'processed']
    );

    return sendSuccess(res, result.rows[0], 'Payout processed', 201);
  } catch (error: any) {
    console.error('Process payout error:', error);
    return sendError(res, error, 'Failed to process payout', 500);
  }
};

// Update platform settings
export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    if (role !== 'admin') {
      return sendError(res, null, 'Admin access required', 403);
    }

    const { setting_key, setting_value } = req.body;

    if (!setting_key || !setting_value) {
      return sendError(res, null, 'setting_key and setting_value are required', 400);
    }

    const result = await pool.query(
      `INSERT INTO platform_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
       RETURNING key, value`,
      [setting_key, JSON.stringify(setting_value)]
    );

    return sendSuccess(res, result.rows[0], 'Settings updated');
  } catch (error: any) {
    console.error('Update settings error:', error);
    return sendError(res, error, 'Failed to update settings', 500);
  }
};
