import { Request, Response } from 'express';
import pool from '../config/db';
import { sendSuccess, sendError } from '../utils/responses';

export interface AuthRequest extends Request {
  user?: any;
}

// Get seller dashboard stats
export const getSellerStats = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.userId;

    if (!sellerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    // Verify user is a seller
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [sellerId]);
    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'seller') {
      return sendError(res, null, 'Only sellers can access this', 403);
    }

    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE seller_id = $1) as total_products,
        (SELECT COUNT(*) FROM orders WHERE seller_id = $1) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE seller_id = $1 AND status = 'completed') as completed_orders,
        (SELECT SUM(total_amount) FROM orders WHERE seller_id = $1 AND status = 'completed') as total_revenue,
        (SELECT AVG(rating) FROM reviews WHERE seller_id = $1) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE seller_id = $1) as total_reviews
    `, [sellerId]);

    const stats = statsResult.rows[0];

    return sendSuccess(res, {
      totalProducts: stats.total_products || 0,
      totalOrders: stats.total_orders || 0,
      completedOrders: stats.completed_orders || 0,
      totalRevenue: stats.total_revenue || 0,
      averageRating: stats.avg_rating ? parseFloat(stats.avg_rating).toFixed(2) : 0,
      totalReviews: stats.total_reviews || 0,
    });
  } catch (error: any) {
    console.error('Get seller stats error:', error);
    return sendError(res, error, 'Failed to get statistics', 500);
  }
};

// Get seller products
export const getSellerProducts = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.userId;
    const { page = 1, limit = 20, status = 'all' } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    if (!sellerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    let query = `SELECT id, name, description, price, images, category, status, views, sales, created_at
                 FROM products WHERE seller_id = $1`;
    const params: any[] = [sellerId];

    if (status !== 'all') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return sendSuccess(res, {
      products: result.rows,
      page: Number(page),
      limit: Number(limit),
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error('Get seller products error:', error);
    return sendError(res, error, 'Failed to get products', 500);
  }
};

// Get seller orders
export const getSellerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.userId;
    const { page = 1, limit = 20, status = 'all' } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    if (!sellerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    let query = `SELECT o.id, o.customer_id, o.total_amount, o.status, o.created_at,
                 u.name as customer_name, u.phone as customer_phone
                 FROM orders o
                 JOIN users u ON o.customer_id = u.id
                 WHERE o.seller_id = $1`;
    const params: any[] = [sellerId];

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
    console.error('Get seller orders error:', error);
    return sendError(res, error, 'Failed to get orders', 500);
  }
};

// Get seller reviews
export const getSellerReviews = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.userId;
    const { page = 1, limit = 20 } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    if (!sellerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const result = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.user_id, r.product_id, r.created_at,
              u.name as customer_name, p.name as product_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN products p ON r.product_id = p.id
       WHERE p.seller_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [sellerId, limit, offset]
    );

    return sendSuccess(res, {
      reviews: result.rows,
      page: Number(page),
      limit: Number(limit),
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error('Get seller reviews error:', error);
    return sendError(res, error, 'Failed to get reviews', 500);
  }
};

// Get seller analytics
export const getSellerAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.userId;
    const { period = 'month' } = req.query;

    if (!sellerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    let dateFilter = "WHERE created_at >= NOW() - INTERVAL '30 days'";
    if (period === 'week') {
      dateFilter = "WHERE created_at >= NOW() - INTERVAL '7 days'";
    } else if (period === 'year') {
      dateFilter = "WHERE created_at >= NOW() - INTERVAL '1 year'";
    }

    const analyticsResult = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total_amount) as revenue
      FROM orders
      WHERE seller_id = $1 AND ${dateFilter.split('WHERE')[1]}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [sellerId]);

    return sendSuccess(res, {
      analytics: analyticsResult.rows,
      period,
    });
  } catch (error: any) {
    console.error('Get seller analytics error:', error);
    return sendError(res, error, 'Failed to get analytics', 500);
  }
};

// Create promotional campaign
export const createCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.userId;
    const { name, description, discount_percent, start_date, end_date, applicable_products } = req.body;

    if (!sellerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!name || discount_percent === undefined) {
      return sendError(res, null, 'name and discount_percent are required', 400);
    }

    const result = await pool.query(
      `INSERT INTO campaigns (seller_id, name, description, discount_percent, start_date, end_date, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, name, discount_percent, status`,
      [sellerId, name, description || null, discount_percent, start_date || null, end_date || null, 'active']
    );

    return sendSuccess(res, result.rows[0], 'Campaign created', 201);
  } catch (error: any) {
    console.error('Create campaign error:', error);
    return sendError(res, error, 'Failed to create campaign', 500);
  }
};

// Update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const sellerId = req.user?.userId;

    if (!sellerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (!status) {
      return sendError(res, null, 'Status is required', 400);
    }

    // Verify order belongs to seller
    const orderCheck = await pool.query(
      'SELECT seller_id FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderCheck.rows.length === 0) {
      return sendError(res, null, 'Order not found', 404);
    }

    if (orderCheck.rows[0].seller_id !== sellerId) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status',
      [status, orderId]
    );

    const io = (req.app as any).get('io');
    if (io) {
      io.to(`order-${orderId}`).emit('order-status-updated', {
        orderId,
        status,
        timestamp: new Date(),
      });
    }

    return sendSuccess(res, result.rows[0], 'Order status updated');
  } catch (error: any) {
    console.error('Update order status error:', error);
    return sendError(res, error, 'Failed to update order status', 500);
  }
};

// Get seller inventory
export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.userId;
    const { page = 1, limit = 20 } = req.query;
    const offset = ((Number(page) - 1) * Number(limit));

    if (!sellerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    const result = await pool.query(
      `SELECT id, name, sku, quantity_available, quantity_sold, price, status
       FROM products
       WHERE seller_id = $1
       ORDER BY updated_at DESC
       LIMIT $2 OFFSET $3`,
      [sellerId, limit, offset]
    );

    return sendSuccess(res, {
      inventory: result.rows,
      page: Number(page),
      limit: Number(limit),
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error('Get inventory error:', error);
    return sendError(res, error, 'Failed to get inventory', 500);
  }
};

// Update inventory
export const updateInventory = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity_available } = req.body;
    const sellerId = req.user?.userId;

    if (!sellerId) {
      return sendError(res, null, 'Unauthorized', 401);
    }

    if (quantity_available === undefined) {
      return sendError(res, null, 'quantity_available is required', 400);
    }

    // Verify product belongs to seller
    const productCheck = await pool.query(
      'SELECT seller_id FROM products WHERE id = $1',
      [productId]
    );

    if (productCheck.rows.length === 0) {
      return sendError(res, null, 'Product not found', 404);
    }

    if (productCheck.rows[0].seller_id !== sellerId) {
      return sendError(res, null, 'Unauthorized', 403);
    }

    const result = await pool.query(
      'UPDATE products SET quantity_available = $1, updated_at = NOW() WHERE id = $2 RETURNING id, quantity_available',
      [quantity_available, productId]
    );

    return sendSuccess(res, result.rows[0], 'Inventory updated');
  } catch (error: any) {
    console.error('Update inventory error:', error);
    return sendError(res, error, 'Failed to update inventory', 500);
  }
};
